import { NextResponse } from "next/server";
import telephonyService from "@/lib/services/telephonyService";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as any));

    // Basic validation
    const to: string | undefined = body?.to;
    if (!to) {
      return NextResponse.json({ error: "Missing required field: to" }, { status: 400 });
    }

    // Resolve tenantId: prefer explicit body.tenantId, otherwise require the active tenant.
    let tenantId: string | null = body?.tenantId ?? null;
    if (!tenantId) {
      try {
        tenantId = await requireActiveTenant();
      } catch {
        // If no tenant context and none provided, allow null (call may be system-level).
        tenantId = null;
      }
    }

    const session = await telephonyService.startCall({
      tenantId: tenantId ?? undefined,
      to,
      from: body?.from,
      webhookUrl: body?.webhookUrl,
      metadata: body?.metadata,
    });

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
