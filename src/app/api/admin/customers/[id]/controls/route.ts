import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { ControlService, TenantControlKey } from "@/lib/services/controlService";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    
    const body = await request.json();
    const { tenantId, control, value, reason } = body;

    if (!tenantId || !control || value === undefined) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const session = await getSession();
    const adminUserId = session?.userId || "system";

    await ControlService.toggleTenantControl(
      tenantId,
      control as TenantControlKey,
      value,
      adminUserId,
      reason || "Admin update"
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
