import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Export Service — CSV/JSON export for analytics, audit logs, and user data.
 */
export class ExportService {
  /**
   * Export audit events as CSV.
   */
  static async exportAuditEventsCSV(
    tenantId?: string,
    from?: string,
    to?: string,
    limit = 1000
  ): Promise<string> {
    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("audit_events")
      .select("id, tenant_id, actor_type, actor_id, event_type, entity_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (tenantId) query = query.eq("tenant_id", tenantId);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;
    if (error || !data) return "";

    // Build CSV
    const headers = ["ID", "Tenant", "Actor Type", "Actor ID", "Event", "Entity", "Entity ID", "Timestamp"];
    const rows = data.map((row) => [
      row.id,
      row.tenant_id || "",
      row.actor_type,
      row.actor_id || "",
      row.event_type,
      row.entity_type,
      row.entity_id || "",
      row.created_at,
    ]);

    return [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  }

  /**
   * Export users list as CSV.
   */
  static async exportUsersCSV(limit = 1000): Promise<string> {
    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, status, business_type, subscription_plan, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return "";

    const headers = ["ID", "Email", "Name", "Role", "Status", "Business Type", "Plan", "Created"];
    const rows = data.map((row) => [
      row.id,
      row.email || "",
      row.full_name || "",
      row.role,
      row.status,
      row.business_type || "",
      row.subscription_plan || "",
      row.created_at,
    ]);

    return [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  }

  /**
   * Export wallet transactions as CSV.
   */
  static async exportWalletTransactionsCSV(
    tenantId: string,
    limit = 500
  ): Promise<string> {
    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("id, type, amount, description, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return "";

    const headers = ["ID", "Type", "Amount", "Description", "Timestamp"];
    const rows = data.map((row) => [
      row.id,
      row.type,
      String(row.amount),
      row.description || "",
      row.created_at,
    ]);

    return [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  }

  /**
   * Export invoices as CSV.
   */
  static async exportInvoicesCSV(userId: string, limit = 200): Promise<string> {
    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from("invoices")
      .select("id, amount, currency, status, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error || !data) return "";

    const headers = ["ID", "Amount", "Currency", "Status", "Date"];
    const rows = data.map((row) => [
      row.id,
      String(row.amount),
      row.currency,
      row.status,
      row.date,
    ]);

    return [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  }
}

/**
 * Escape a value for CSV output.
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
