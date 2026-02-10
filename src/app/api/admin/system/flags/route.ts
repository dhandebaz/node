import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlService, SystemFlagKey } from "@/lib/services/controlService";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();
    
    if (typeof value !== 'boolean') {
      return NextResponse.json({ error: "Value must be boolean" }, { status: 400 });
    }

    await ControlService.toggleSystemFlag(key as SystemFlagKey, value, session.userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
