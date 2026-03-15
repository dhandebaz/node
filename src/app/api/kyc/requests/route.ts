import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { KycService } from "@/lib/services/kycService";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    const requests = await KycService.listKycRequests(tenantId);

    return NextResponse.json({ requests });
  } catch (err: any) {
    log.error("GET /api/kyc/requests failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    const body = await req.json().catch(() => ({}));
    const {
      guest_name,
      guest_email,
      guest_phone,
      booking_reference,
      booking_id,
      consent_form_id,
    } = body;

    const request = await KycService.createKycRequest(tenantId, {
      guest_name,
      guest_email,
      guest_phone,
      booking_reference,
      booking_id,
      consent_form_id,
    });

    const link = KycService.getKycLink(request.token);

    log.info("KYC request created via API", {
      requestId: request.id,
      tenantId,
      guestName: guest_name,
    });

    return NextResponse.json({ request, link }, { status: 201 });
  } catch (err: any) {
    log.error("POST /api/kyc/requests failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
