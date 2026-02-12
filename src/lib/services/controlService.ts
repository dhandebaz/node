import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getPersonaCapabilities } from "@/lib/business-context";
import { BusinessType } from "@/types";

export type SystemFlagKey = 
  | 'ai_global_enabled'
  | 'payments_global_enabled'
  | 'bookings_global_enabled'
  | 'messaging_global_enabled'
  | 'sync_global_enabled'
  | 'signups_global_enabled'
  | 'incident_mode_enabled';

export type TenantControlKey =
  | 'is_ai_enabled'
  | 'is_messaging_enabled'
  | 'is_bookings_enabled'
  | 'is_wallet_enabled'
  | 'early_access';

export class ControlService {
  /**
   * Get all system flags (Global Kill Switches)
   */
  static async getSystemFlags() {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('system_flags')
      .select('*');
    
    if (error) throw error;
    
    // Convert to map for easier access
    const flags: Record<string, boolean> = {};
    data?.forEach(f => flags[f.key] = f.value);
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
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*');
    
    if (error) throw error;
    
    // Resolve flags
    const flags: Record<string, boolean> = {};
    data?.forEach(f => {
      // Enabled if globally enabled OR tenant is in overrides
      const isEnabled = f.is_global_enabled || (tenantId && f.tenant_overrides?.includes(tenantId));
      flags[f.key] = !!isEnabled;
    });
    return flags;
  }

  /**
   * Toggle a feature flag (Admin only)
   */
  static async toggleFeatureFlag(key: string, isGlobal: boolean, tenantIds: string[], userId: string, description?: string) {
    const supabase = await getSupabaseAdmin();
    
    const payload: any = { 
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
    const supabase = await getSupabaseServer(); // Use server client (RLS safe for reading flags)

    // 1. Fetch Global Flags & Tenant Controls in parallel
    // If tenantId is null (e.g. signup), we only fetch flags
    const promises: any[] = [supabase.from('system_flags').select('key, value')];
    if (tenantId) {
      promises.push(supabase.from('tenants').select('is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, business_type').eq('id', tenantId).single());
    }

    const [flagsRes, tenantRes] = await Promise.all(promises);

    const flags: Record<string, boolean> = {};
    flagsRes.data?.forEach((f: any) => flags[f.key] = f.value);
    const tenant = tenantRes?.data;

    // 2. Check Global Kill Switches
    if (flags['incident_mode_enabled'] === true) throw new Error("System is in Incident Mode. High-risk actions are temporarily disabled.");
    if (action === 'ai' && flags['ai_global_enabled'] === false) throw new Error("AI actions are currently disabled globally.");
    if (action === 'payment' && flags['payments_global_enabled'] === false) throw new Error("Payments are currently disabled globally.");
    if (action === 'booking' && flags['bookings_global_enabled'] === false) throw new Error("New bookings are currently disabled globally.");
    if (action === 'message' && flags['messaging_global_enabled'] === false) throw new Error("Outbound messaging is currently disabled globally.");
    if (action === 'sync' && flags['sync_global_enabled'] === false) throw new Error("Integrations sync is currently disabled globally.");
    if (action === 'signup' && flags['signups_global_enabled'] === false) throw new Error("New signups are currently paused. Please join our waitlist.");

    // If no tenant (signup), we are done checking global flags
    if (!tenantId || !tenant) return;

    // 3. Check Tenant Controls
    if (action === 'ai' && tenant.is_ai_enabled === false) throw new Error("AI actions are disabled for this account.");
    if (action === 'payment' && tenant.is_wallet_enabled === false) throw new Error("Wallet/Payments are disabled for this account.");
    if (action === 'booking' && tenant.is_bookings_enabled === false) throw new Error("Bookings are disabled for this account.");
    if (action === 'message' && tenant.is_messaging_enabled === false) throw new Error("Messaging is disabled for this account.");

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
      throw new Error(blockedReason);
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
