import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { wahaService } from "@/lib/services/wahaService";
import { getAppUrl } from "@/lib/runtime-config";

/**
 * WAHA Debug Route
 *
 * Purpose: For authenticated tenants only. Calls wahaService.startSession()
 * with a webhook url derived from the app URL and returns the raw WAHA
 * response (useful to debug QR generation and session startup).
 *
 * Note: This endpoint should only be used in development or staging. It is
 * protected by auth and tenant requirement, but be mindful to not expose
 * it in production without appropriate access controls.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tenantId: string;
  try {
    tenantId = await requireActiveTenant();
  } catch (e: any) {
    console.error("WAHA debug: requireActiveTenant failed:", e);
    return NextResponse.json({ error: "Tenant context required" }, { status: 403 });
  }

  try {
    const appUrl = getAppUrl() || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl.replace(/\/+$/, "")}/api/integrations/webhook/whatsapp?tenantId=${encodeURIComponent(
      tenantId,
    )}`;

    const result = await wahaService.startSession({
      sessionName: tenantId,
      webhooks: [{ url: webhookUrl, events: ["message"] }],
    });

    return NextResponse.json({ success: true, raw: result });
  } catch (error: any) {
    console.error("WAHA debug startSession error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 },
    );
  }
}
