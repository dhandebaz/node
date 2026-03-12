import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getPersonaCapabilities } from "@/lib/business-context";
import { BusinessType } from "@/types";

export type SystemFlagKey = 
  | 'ai_global_enabled'
  | 'bookings_global_enabled'
  | 'incident_mode_enabled'
  | 'messaging_global_enabled'
  | 'payments_global_enabled'
  | 'signups_global_enabled'
  | 'sync_global_enabled';

export type TenantControlKey =
  | 'is_ai_enabled'
  | 'is_messaging_enabled'
  | 'is_bookings_enabled'
  | 'is_wallet_enabled'
  | 'early_access';

type ActionBlockedError = Error & { status?: number };

const createActionBlockedError = (message: string, status: number): ActionBlockedError => {
  const error = new Error(message) as ActionBlockedError;
  error.status = status;
  return error;
};

type PostgrestResponse<T> = { data: T | null; error: unknown | null };
type SystemFlagRow = { key: string; value: boolean };
type TenantControlsRow = {
  is_ai_enabled: boolean | null;
  is_messaging_enabled: boolean | null;
  is_bookings_enabled: boolean | null;
  is_wallet_enabled: boolean | null;
  business_type: string | null;
  kyc_status: string | null;
};

export class ControlService {
  /**
   * Get all system flags (Global Kill Switches)
   */
  static async getSystemFlags() {
    const flags: Record<string, boolean> = {};

    try {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase.from("system_flags").select("*");

      if (!error) {
        data?.forEach((f) => (flags[f.key] = f.value));
        return flags;
      }
    } catch {
    }

    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const { data, error } = await supabaseAdmin.from("system_flags").select("*");
      if (!error) {
        data?.forEach((f) => (flags[f.key] = f.value));
      }
    } catch {
    }

    return flags;
  }

  /**
   * Toggle a global system flag (Admin only)
   */
  static async toggleSystemFlag(key: SystemFlagKey, value: boolean, userId: string) {
    const supabase = await getSupabaseAdmin();
    
    const { error } = await supabase
      .from('system_flags')
      .upsert({ 
        key, 
        value,
        updated_by: userId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    await logEvent({
      actor_type: 'admin',
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_SYSTEM_FLAG_CHANGED,
      entity_type: 'system_flag',
      entity_id: key,
      metadata: { key, value }
    });
  }

  /**
   * Toggle a tenant-specific control (Admin only)
   */
  static async toggleTenantControl(tenantId: string, control: TenantControlKey, value: boolean, userId: string, reason: string) {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from('tenants')
      .update({ [control]: value })
      .eq('id', tenantId);

    if (error) throw error;

    await logEvent({
      tenant_id: tenantId,
      actor_type: 'admin',
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_TENANT_CONTROL_CHANGED,
      entity_type: 'tenant',
      entity_id: tenantId,
      metadata: { control, value, reason }
    });
  }

  /**
   * Get all feature flags for a tenant
   */
  static async getFeatureFlags(tenantId?: string) {
    const resolve = (data: any[] | null) => {
      const flags: Record<string, boolean> = {};
      data?.forEach((f: any) => {
        const isEnabled = f.is_global_enabled || (tenantId && f.tenant_overrides?.includes(tenantId));
        flags[f.key] = !!isEnabled;
      });
      return flags;
    };

    try {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase.from("feature_flags").select("*");
      if (!error) return resolve(data as any);
    } catch {
    }

    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const { data, error } = await supabaseAdmin.from("feature_flags").select("*");
      if (!error) return resolve(data as any);
    } catch {
    }

    return {};
  }

  /**
   * Toggle a feature flag (Admin only)
   */
  static async toggleFeatureFlag(key: string, isGlobal: boolean, tenantIds: string[], userId: string, description?: string) {
    const supabase = await getSupabaseAdmin();
    
    const payload: {
      key: string;
      is_global_enabled: boolean;
      tenant_overrides: string[];
      updated_at: string;
      description?: string;
    } = {
      key, 
      is_global_enabled: isGlobal,
      tenant_overrides: tenantIds,
      updated_at: new Date().toISOString()
    };
    if (description) payload.description = description;

    const { error } = await supabase
      .from('feature_flags')
      .upsert(payload);

    if (error) throw error;

    await logEvent({
      actor_type: 'admin',
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_SYSTEM_FLAG_CHANGED, // Reusing event type
      entity_type: 'feature_flag',
      entity_id: key,
      metadata: { isGlobal, tenantIds, description }
    });
  }

  /**
   * Check if a specific action is allowed for a tenant.
   * Checks both Global Kill Switches AND Tenant Controls.
   * Throws error if disabled.
   */
  static async checkAction(tenantId: string | null, action: 'ai' | 'payment' | 'booking' | 'message' | 'sync' | 'signup') {
    const supabase = await getSupabaseServer();

    const flagsPromise = supabase
      .from('system_flags')
      .select('key, value') as unknown as Promise<PostgrestResponse<SystemFlagRow[]>>;

    let flagsRes: PostgrestResponse<SystemFlagRow[]>;
    let tenantRes: PostgrestResponse<TenantControlsRow> | null = null;

    if (tenantId) {
      const tenantPromise = supabase
        .from('tenants')
        .select('is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, business_type, kyc_status')
        .eq('id', tenantId)
        .single() as unknown as Promise<PostgrestResponse<TenantControlsRow>>;

      [flagsRes, tenantRes] = await Promise.all([flagsPromise, tenantPromise]);
    } else {
      flagsRes = await flagsPromise;
    }

    const shouldRetryWithAdmin = !!flagsRes.error || (!!tenantId && !!tenantRes?.error);
    if (shouldRetryWithAdmin) {
      const supabaseAdmin = await getSupabaseAdmin();
      const adminFlagsPromise = supabaseAdmin
        .from('system_flags')
        .select('key, value') as unknown as Promise<PostgrestResponse<SystemFlagRow[]>>;

      if (tenantId) {
        const adminTenantPromise = supabaseAdmin
          .from('tenants')
          .select('is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, business_type, kyc_status')
          .eq('id', tenantId)
          .single() as unknown as Promise<PostgrestResponse<TenantControlsRow>>;

        [flagsRes, tenantRes] = await Promise.all([adminFlagsPromise, adminTenantPromise]);
      } else {
        flagsRes = await adminFlagsPromise;
      }
    }

    if (flagsRes.error) throw createActionBlockedError("System is temporarily unavailable.", 503);
    if (tenantId && tenantRes?.error) throw createActionBlockedError("Account settings are temporarily unavailable.", 503);

    const flags: Record<string, boolean> = {};
    (flagsRes.data || []).forEach((f) => (flags[f.key] = f.value));
    const tenant = tenantRes?.data || null;

    // 2. Check Global Kill Switches
    if (flags['incident_mode_enabled'] === true) throw createActionBlockedError("System is temporarily limiting high-risk actions.", 503);
    if (action === 'ai' && flags['ai_global_enabled'] === false) throw createActionBlockedError("AI actions are temporarily unavailable.", 503);
    if (action === 'payment' && flags['payments_global_enabled'] === false) throw createActionBlockedError("Payments are temporarily unavailable.", 503);
    if (action === 'booking' && flags['bookings_global_enabled'] === false) throw createActionBlockedError("New bookings are temporarily unavailable.", 503);
    if (action === 'message' && flags['messaging_global_enabled'] === false) throw createActionBlockedError("Outbound messaging is temporarily unavailable.", 503);
    if (action === 'sync' && flags['sync_global_enabled'] === false) throw createActionBlockedError("Integrations sync is temporarily unavailable.", 503);
    
    // 3. New User Signups Control (Used in Auth/Onboarding)
    if (action === 'signup' && flags['signups_global_enabled'] === false) throw createActionBlockedError("New signups are temporarily disabled.", 503);
    if (action === 'signup' && flags['signups_global_enabled'] === false) throw createActionBlockedError("Signups are currently unavailable.", 403);

    // If no tenant (signup), we are done checking global flags
    if (!tenantId || !tenant) return;

    // 3. Check Tenant Controls
    if (action === 'ai' && tenant.is_ai_enabled === false) throw createActionBlockedError("AI actions are disabled for this account.", 403);
    if (action === 'payment' && tenant.is_wallet_enabled === false) throw createActionBlockedError("Payments are disabled for this account.", 403);
    if (action === 'booking' && tenant.is_bookings_enabled === false) throw createActionBlockedError("Bookings are disabled for this account.", 403);
    if (action === 'message' && tenant.is_messaging_enabled === false) throw createActionBlockedError("Messaging is disabled for this account.", 403);

    const kycStatus = String(tenant.kyc_status || 'pending');
    const isVerified = kycStatus === 'verified';
    if ((action === 'message' || action === 'payment') && !isVerified) {
      throw createActionBlockedError("Identity verification is required to use this feature. Complete verification in Settings.", 403);
    }

    // 4. Check Persona Capabilities (Safety Layer)
    const capabilities = getPersonaCapabilities(tenant.business_type as BusinessType);
    let blockedReason: string | null = null;

    if (action === 'booking' && !capabilities.bookings) blockedReason = `Bookings are not enabled for ${tenant.business_type || 'this persona'}`;
    if (action === 'payment' && !capabilities.payments) blockedReason = `Payments are not enabled for ${tenant.business_type || 'this persona'}`;
    
    if (blockedReason) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'system',
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'control_service',
        entity_id: action,
        metadata: { reason: blockedReason, business_type: tenant.business_type }
      });
      throw createActionBlockedError(blockedReason, 403);
    }
  }

  /**
   * Get System Health Status (Mocked + Real Checks)
   */
  static async getSystemHealth() {
    // In a real system, we'd hit external health checks or check DB connectivity
    const supabase = await getSupabaseServer();
    const start = Date.now();
    const { error } = await supabase.from('system_flags').select('key').limit(1);
    const dbLatency = Date.now() - start;

    return {
      auth: { status: 'healthy', last_checked: new Date().toISOString() },
      database: { status: error ? 'degraded' : 'healthy', last_checked: new Date().toISOString(), latency: dbLatency },
      ai_service: { status: 'healthy', last_checked: new Date().toISOString() }, // Mock
      payments: { status: 'healthy', last_checked: new Date().toISOString() }, // Mock
      integrations: { status: 'healthy', last_checked: new Date().toISOString() } // Mock
    };
  }
}
