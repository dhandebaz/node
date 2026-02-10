import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ControlService } from "@/lib/services/controlService";
import { FailureRecord } from "@/types/failure";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await getSupabaseServer();
    const { data: failures, error } = await supabase
      .from("failures")
      .select("*")
      .eq("tenant_id", session.tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const resultFailures: FailureRecord[] = failures || [];

    // Check for global incident mode
    const flags = await ControlService.getSystemFlags();
    if (flags['incident_mode_enabled']) {
      resultFailures.unshift({
        id: 'system-incident',
        tenant_id: session.tenantId,
        category: 'system',
        source: 'system',
        severity: 'critical',
        message: 'We are experiencing system-wide issues. Some features may be unavailable.',
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ failures: resultFailures });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
