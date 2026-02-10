import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { ControlService, TenantControlKey } from "@/lib/services/controlService";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin();
    // id is not strictly needed if tenantId is in body, but good for validation if we wanted to
    // const { id } = await params; 
    
    const body = await request.json();
    const { tenantId, control, value, reason } = body;

    if (!tenantId || !control || value === undefined) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Call ControlService to toggle
    await ControlService.toggleTenantControl(
      tenantId,
      control as TenantControlKey,
      value,
      adminUser.id,
      reason || "Admin update"
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
