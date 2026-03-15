import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { KycService } from "@/lib/services/kycService";
import { log } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    const request = await KycService.getKycRequestById(id, tenantId);

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If the request has a completed signature, attach a signed PDF download URL
    let pdfUrl: string | null = null;
    if (request.signature?.pdf_storage_path) {
      pdfUrl = await KycService.getSignedPdfUrl(
        request.signature.pdf_storage_path
      );
    }

    return NextResponse.json({ request, pdfUrl });
  } catch (err: any) {
    log.error("GET /api/kyc/requests/[id] failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Verify the request exists and belongs to this tenant before attempting delete
    const existing = await KycService.getKycRequestById(id, tenantId);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.status === "completed" || existing.status === "in_progress") {
      return NextResponse.json(
        {
          error:
            "Cannot delete a KYC request that is in progress or already completed. Completed requests are retained for audit purposes.",
        },
        { status: 400 }
      );
    }

    await KycService.deleteKycRequest(id, tenantId);

    log.info("KYC request deleted", { requestId: id, tenantId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    log.error("DELETE /api/kyc/requests/[id] failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
