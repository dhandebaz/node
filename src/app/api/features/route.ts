import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlService } from "@/lib/services/controlService";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const tenantId = session?.tenantId;

  try {
    const flags = await ControlService.getFeatureFlags(tenantId);
    return NextResponse.json({ flags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
