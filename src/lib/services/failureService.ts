import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { CreateFailureParams, FailureCategory, FailureRecord } from "@/types/failure";

export class FailureService {
  /**
   * Raises a new failure or updates an existing active one from the same source.
   */
  static async raiseFailure(params: CreateFailureParams) {
    const supabase = await getSupabaseAdmin();
    
    // Check for existing active failure to avoid spam
    const { data: existing } = await supabase
      .from("failures")
      .select("id, message, severity")
      .eq("tenant_id", params.tenant_id)
      .eq("source", params.source)
      .eq("category", params.category)
      .eq("is_active", true)
      .maybeSingle();

    if (existing) {
      // If severity increased or message changed, update it
      if (existing.message !== params.message || existing.severity !== params.severity) {
        await supabase
          .from("failures")
          .update({ 
            message: params.message, 
            severity: params.severity, 
            metadata: params.metadata,
            created_at: new Date().toISOString() // Bump timestamp to show it's recent
          })
          .eq("id", existing.id);
      }
      return existing.id;
    }

    // Create new failure
    const { data: failure, error } = await supabase
      .from("failures")
      .insert({
        tenant_id: params.tenant_id,
        category: params.category,
        source: params.source,
        severity: params.severity,
        message: params.message,
        metadata: params.metadata || {},
        is_active: true
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to raise failure:", error);
      return null;
    }

    // Log to audit
    await logEvent({
      tenant_id: params.tenant_id,
      actor_type: 'system',
      event_type: EVENT_TYPES.FAILURE_DETECTED,
      entity_type: 'failure',
      entity_id: failure.id,
      metadata: {
        category: params.category,
        source: params.source,
        severity: params.severity,
        message: params.message
      }
    });

    return failure.id;
  }

  /**
   * Marks a failure as resolved.
   */
  static async resolveFailure(tenantId: string, source: string, category: FailureCategory) {
    const supabase = await getSupabaseAdmin();

    const { data: failures } = await supabase
      .from("failures")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("source", source)
      .eq("category", category)
      .eq("is_active", true);

    if (!failures?.length) return;

    for (const f of failures) {
      await supabase
        .from("failures")
        .update({ 
          is_active: false, 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", f.id);

      await logEvent({
        tenant_id: tenantId,
        actor_type: 'system',
        event_type: EVENT_TYPES.FAILURE_RESOLVED,
        entity_type: 'failure',
        entity_id: f.id,
        metadata: { source, category }
      });
    }
  }

  /**
   * Checks if there are any critical failures that should block an action.
   */
  static async checkBlockers(tenantId: string, category?: FailureCategory): Promise<FailureRecord[]> {
    const supabase = await getSupabaseAdmin();
    
    let query = supabase
      .from("failures")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .eq("severity", "critical");

    if (category) {
      query = query.eq("category", category);
    }

    const { data } = await query;
    return (data as FailureRecord[]) || [];
  }

  /**
   * Gets all active failures for a tenant.
   */
  static async getActiveFailures(tenantId: string): Promise<FailureRecord[]> {
    const supabase = await getSupabaseAdmin();
    const { data } = await supabase
      .from("failures")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return (data as FailureRecord[]) || [];
  }
}
