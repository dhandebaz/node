import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlService } from "@/lib/services/controlService";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [health, flags] = await Promise.all([
      ControlService.getSystemHealth(),
      ControlService.getSystemFlags()
    ]);

    return NextResponse.json({ health, flags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
