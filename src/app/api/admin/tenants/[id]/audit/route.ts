import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: tenantId } = await params;
    const supabase = await getSupabaseAdmin();

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const { data: auditLogs, error } = await supabase
      .from("system_logs")
      .select("id, severity, service, message, metadata, timestamp, user_id")
      .or(`service.eq.admin_control,service.eq.control_change,service.eq.tenant_modification`)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit logs" },
        { status: 500 }
      );
    }

    const logsWithDetails = (auditLogs || []).map((log: any) => ({
      ...log,
      action: log.metadata?.action || log.service,
      changedBy: log.metadata?.admin_id || log.user_id,
      details: log.metadata,
    }));

    return NextResponse.json({
      tenant_name: tenant.name,
      logs: logsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
