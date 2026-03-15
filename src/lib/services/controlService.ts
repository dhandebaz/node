import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getPersonaCapabilities } from "@/lib/business-context";
import { BusinessType } from "@/types";
import { hasRazorpayCredentials } from "@/lib/runtime-config";

export type SystemFlagKey =
  | "ai_global_enabled"
  | "bookings_global_enabled"
  | "incident_mode_enabled"
  | "messaging_global_enabled"
  | "payments_global_enabled"
  | "signups_global_enabled"
  | "sync_global_enabled";

export type TenantControlKey =
  | "is_ai_enabled"
  | "is_messaging_enabled"
  | "is_bookings_enabled"
  | "is_wallet_enabled"
  | "early_access";

type ActionBlockedError = Error & { status?: number };

const createActionBlockedError = (
  message: string,
  status: number,
): ActionBlockedError => {
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
    } catch {}

    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("system_flags")
        .select("*");
      if (!error) {
        data?.forEach((f) => (flags[f.key] = f.value));
      }
    } catch {}

    return flags;
  }

  /**
   * Toggle a global system flag (Admin only)
   */
  static async toggleSystemFlag(
    key: SystemFlagKey,
    value: boolean,
    userId: string,
  ) {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from("system_flags").upsert({
      key,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logEvent({
      actor_type: "admin",
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_SYSTEM_FLAG_CHANGED,
      entity_type: "system_flag",
      entity_id: key,
      metadata: { key, value },
    });
  }

  /**
   * Toggle a tenant-specific control (Admin only)
   */
  static async toggleTenantControl(
    tenantId: string,
    control: TenantControlKey,
    value: boolean,
    userId: string,
    reason: string,
  ) {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("tenants")
      .update({ [control]: value })
      .eq("id", tenantId);

    if (error) throw error;

    await logEvent({
      tenant_id: tenantId,
      actor_type: "admin",
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_TENANT_CONTROL_CHANGED,
      entity_type: "tenant",
      entity_id: tenantId,
      metadata: { control, value, reason },
    });
  }

  /**
   * Get all feature flags for a tenant
   */
  static async getFeatureFlags(tenantId?: string) {
    const resolve = (data: any[] | null) => {
      const flags: Record<string, boolean> = {};
      data?.forEach((f: any) => {
        const isEnabled =
          f.is_global_enabled ||
          (tenantId && f.tenant_overrides?.includes(tenantId));
        flags[f.key] = !!isEnabled;
      });
      return flags;
    };

    try {
      const supabase = await getSupabaseServer();
      const { data, error } = await supabase.from("feature_flags").select("*");
      if (!error) return resolve(data as any);
    } catch {}

    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("feature_flags")
        .select("*");
      if (!error) return resolve(data as any);
    } catch {}

    return {};
  }

  /**
   * Toggle a feature flag (Admin only)
   */
  static async toggleFeatureFlag(
    key: string,
    isGlobal: boolean,
    tenantIds: string[],
    userId: string,
    description?: string,
  ) {
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
      updated_at: new Date().toISOString(),
    };
    if (description) payload.description = description;

    const { error } = await supabase.from("feature_flags").upsert(payload);

    if (error) throw error;

    await logEvent({
      actor_type: "admin",
      actor_id: userId,
      event_type: EVENT_TYPES.ADMIN_SYSTEM_FLAG_CHANGED, // Reusing event type
      entity_type: "feature_flag",
      entity_id: key,
      metadata: { isGlobal, tenantIds, description },
    });
  }

  /**
   * Check if a specific action is allowed for a tenant.
   * Checks both Global Kill Switches AND Tenant Controls.
   * Throws error if disabled.
   */
  static async checkAction(
    tenantId: string | null,
    action: "ai" | "payment" | "booking" | "message" | "sync" | "signup",
  ) {
    const supabase = await getSupabaseServer();

    const flagsPromise = supabase
      .from("system_flags")
      .select("key, value") as unknown as Promise<
      PostgrestResponse<SystemFlagRow[]>
    >;

    let flagsRes: PostgrestResponse<SystemFlagRow[]>;
    let tenantRes: PostgrestResponse<TenantControlsRow> | null = null;

    if (tenantId) {
      const tenantPromise = supabase
        .from("tenants")
        .select(
          "is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, business_type, kyc_status",
        )
        .eq("id", tenantId)
        .single() as unknown as Promise<PostgrestResponse<TenantControlsRow>>;

      [flagsRes, tenantRes] = await Promise.all([flagsPromise, tenantPromise]);
    } else {
      flagsRes = await flagsPromise;
    }

    const shouldRetryWithAdmin =
      !!flagsRes.error || (!!tenantId && !!tenantRes?.error);
    if (shouldRetryWithAdmin) {
      const supabaseAdmin = await getSupabaseAdmin();
      const adminFlagsPromise = supabaseAdmin
        .from("system_flags")
        .select("key, value") as unknown as Promise<
        PostgrestResponse<SystemFlagRow[]>
      >;

      if (tenantId) {
        const adminTenantPromise = supabaseAdmin
          .from("tenants")
          .select(
            "is_ai_enabled, is_messaging_enabled, is_bookings_enabled, is_wallet_enabled, business_type, kyc_status",
          )
          .eq("id", tenantId)
          .single() as unknown as Promise<PostgrestResponse<TenantControlsRow>>;

        [flagsRes, tenantRes] = await Promise.all([
          adminFlagsPromise,
          adminTenantPromise,
        ]);
      } else {
        flagsRes = await adminFlagsPromise;
      }
    }

    const flags: Record<string, boolean> = {
      ai_global_enabled: true,
      payments_global_enabled: true,
      bookings_global_enabled: true,
      messaging_global_enabled: true,
      sync_global_enabled: true,
      signups_global_enabled: true,
      incident_mode_enabled: false,
    };

    if (flagsRes.data) {
      flagsRes.data.forEach((f) => (flags[f.key] = f.value));
    } else if (flagsRes.error) {
      console.warn(
        "[ControlService] Failed to fetch system flags, using safe defaults. Error:",
        flagsRes.error,
      );
      // In development or if table is missing, we don't want to lock out the whole system.
      // However, if we need strict compliance, we'd throw. For now, resilience is prioritized.
    }

    const tenant = tenantRes?.data || null;

    // 2. Check Global Kill Switches
    if (flags["incident_mode_enabled"] === true)
      throw createActionBlockedError(
        "System is temporarily limiting high-risk actions.",
        503,
      );
    if (action === "ai" && flags["ai_global_enabled"] === false)
      throw createActionBlockedError(
        "AI actions are temporarily unavailable.",
        503,
      );
    if (action === "payment" && flags["payments_global_enabled"] === false)
      throw createActionBlockedError(
        "Payments are temporarily unavailable.",
        503,
      );
    if (action === "booking" && flags["bookings_global_enabled"] === false)
      throw createActionBlockedError(
        "New bookings are temporarily unavailable.",
        503,
      );
    if (action === "message" && flags["messaging_global_enabled"] === false)
      throw createActionBlockedError(
        "Outbound messaging is temporarily unavailable.",
        503,
      );
    if (action === "sync" && flags["sync_global_enabled"] === false)
      throw createActionBlockedError(
        "Integrations sync is temporarily unavailable.",
        503,
      );

    // 3. New User Signups Control (Used in Auth/Onboarding)
    if (action === "signup" && flags["signups_global_enabled"] === false)
      throw createActionBlockedError(
        "New signups are temporarily disabled.",
        503,
      );

    // If no tenant (signup), we are done checking global flags
    if (!tenantId || !tenant) return;

    // 3. Check Tenant Controls
    if (action === "ai" && tenant.is_ai_enabled === false)
      throw createActionBlockedError(
        "AI actions are disabled for this account.",
        403,
      );
    if (action === "payment" && tenant.is_wallet_enabled === false)
      throw createActionBlockedError(
        "Payments are disabled for this account.",
        403,
      );
    if (action === "booking" && tenant.is_bookings_enabled === false)
      throw createActionBlockedError(
        "Bookings are disabled for this account.",
        403,
      );
    if (action === "message" && tenant.is_messaging_enabled === false)
      throw createActionBlockedError(
        "Messaging is disabled for this account.",
        403,
      );

    const kycStatus = String(tenant.kyc_status || "pending");
    const isVerified = kycStatus === "verified";
    if ((action === "message" || action === "payment") && !isVerified) {
      throw createActionBlockedError(
        "Identity verification is required to use this feature. Complete verification in Settings.",
        403,
      );
    }

    // 4. Check Persona Capabilities (Safety Layer)
    const capabilities = getPersonaCapabilities(
      tenant.business_type as BusinessType,
    );
    let blockedReason: string | null = null;

    if (action === "booking" && !capabilities.bookings)
      blockedReason = `Bookings are not enabled for ${tenant.business_type || "this persona"}`;
    if (action === "payment" && !capabilities.payments)
      blockedReason = `Payments are not enabled for ${tenant.business_type || "this persona"}`;

    if (blockedReason) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: "system",
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: "control_service",
        entity_id: action,
        metadata: {
          reason: blockedReason,
          business_type: tenant.business_type,
        },
      });
      throw createActionBlockedError(blockedReason, 403);
    }
  }

  /**
   * Get System Health Status — performs real checks against DB, AI, payments, and integrations.
   */
  static async getSystemHealth() {
    const now = new Date().toISOString();
    const supabase = await getSupabaseServer();

    // ── Database ──────────────────────────────────────────────────────────────
    const dbStart = Date.now();
    const { error: dbError } = await supabase
      .from("system_flags")
      .select("key")
      .limit(1);
    const dbLatency = Date.now() - dbStart;

    // ── Auth ──────────────────────────────────────────────────────────────────
    // Validate that the Supabase URL and anon key are configured and the auth
    // endpoint is reachable within a short timeout.
    let authStatus: "healthy" | "degraded" | "down" = "healthy";
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        authStatus = "degraded";
      } else {
        const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
          signal: AbortSignal.timeout(5_000),
        });
        authStatus = res.ok ? "healthy" : "degraded";
      }
    } catch {
      authStatus = "degraded";
    }

    // ── AI Service ────────────────────────────────────────────────────────────
    // Check the global AI kill switch and whether the configured AI key is present.
    let aiStatus: "healthy" | "degraded" | "disabled" = "healthy";
    let aiMessage: string | undefined;
    try {
      const { data: aiFlag } = await supabase
        .from("system_flags")
        .select("value")
        .eq("key", "ai_global_enabled")
        .maybeSingle();

      if (aiFlag && aiFlag.value === false) {
        aiStatus = "disabled";
        aiMessage = "AI globally disabled via system flag";
      } else {
        // AI Gateway works with either an explicit API key or Vercel OIDC in deployments.
        const hasGatewayAuth =
          !!process.env.AI_GATEWAY_API_KEY || !!process.env.VERCEL;
        const hasGeminiKey =
          !!process.env.GEMINI_API_KEY ||
          !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
        const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

        if (
          !hasGatewayAuth &&
          !hasGeminiKey &&
          !hasOpenAiKey &&
          !hasAnthropicKey
        ) {
          aiStatus = "degraded";
          aiMessage = "No AI gateway or provider API key configured";
        }
      }
    } catch {
      aiStatus = "degraded";
      aiMessage = "Failed to check AI service status";
    }

    // ── Payments ──────────────────────────────────────────────────────────────
    // Check global payments kill switch and Razorpay key presence.
    let paymentsStatus: "healthy" | "degraded" | "disabled" = "healthy";
    let paymentsMessage: string | undefined;
    try {
      const { data: payFlag } = await supabase
        .from("system_flags")
        .select("value")
        .eq("key", "payments_global_enabled")
        .maybeSingle();

      if (payFlag && payFlag.value === false) {
        paymentsStatus = "disabled";
        paymentsMessage = "Payments globally disabled via system flag";
      } else {
        const hasRazorpayKey = hasRazorpayCredentials();

        if (!hasRazorpayKey) {
          paymentsStatus = "degraded";
          paymentsMessage = "Razorpay credentials are not configured";
        }
      }
    } catch {
      paymentsStatus = "degraded";
      paymentsMessage = "Failed to check payments service status";
    }

    // ── Integrations ──────────────────────────────────────────────────────────
    // Count integration records with error status across all tenants.
    let integrationsStatus: "healthy" | "degraded" = "healthy";
    let integrationsMessage: string | undefined;
    let integrationsErrorCount = 0;
    try {
      const admin = await getSupabaseAdmin();
      const { count, error: intError } = await admin
        .from("integrations")
        .select("id", { count: "exact", head: true })
        .eq("status", "error");

      if (!intError && count !== null && count > 0) {
        integrationsErrorCount = count;
        integrationsStatus = "degraded";
        integrationsMessage = `${count} integration(s) currently in error state`;
      }
    } catch {
      integrationsStatus = "degraded";
      integrationsMessage = "Failed to check integration health";
    }

    return {
      auth: {
        status: authStatus,
        last_checked: now,
      },
      database: {
        status: dbError ? "degraded" : "healthy",
        last_checked: now,
        latency: dbLatency,
        error: dbError
          ? String((dbError as any).message ?? dbError)
          : undefined,
      },
      ai_service: {
        status: aiStatus,
        last_checked: now,
        message: aiMessage,
      },
      payments: {
        status: paymentsStatus,
        last_checked: now,
        message: paymentsMessage,
      },
      integrations: {
        status: integrationsStatus,
        last_checked: now,
        errorCount: integrationsErrorCount,
        message: integrationsMessage,
      },
    };
  }
}
