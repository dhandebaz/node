import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlService } from "@/lib/services/controlService";
import { getActiveTenantId } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const tenantId = await getActiveTenantId();

  try {
    const flags = await ControlService.getFeatureFlags(tenantId || undefined);
    return NextResponse.json({ flags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
