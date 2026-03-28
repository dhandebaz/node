import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { KycService } from "@/lib/services/kycService";
import { log } from "@/lib/logger";

export async function PATCH(
  req: Request,
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

    const body = await req.json().catch(() => ({}));
    const { title, body_markdown, version, is_active } = body;

    // Build only the fields that were actually provided
    const updates: Record<string, unknown> = {};
    if (typeof title === "string" && title.trim()) {
      updates.title = title.trim();
    }
    if (typeof body_markdown === "string" && body_markdown.trim()) {
      updates.body_markdown = body_markdown.trim();
    }
    if (typeof version === "string" && version.trim()) {
      updates.version = version.trim();
    }
    if (typeof is_active === "boolean") {
      updates.is_active = is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const form = await KycService.updateConsentForm(id, tenantId, updates);

    log.info("Consent form updated", { formId: id, tenantId, updates });

    return NextResponse.json({ form });
  } catch (err: any) {
    log.error("PATCH /api/kyc/consent-forms/[id] failed", err);
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

    // Check if any KYC requests still reference this consent form.
    // Deleting a form that is attached to existing requests would break
    // the audit trail  -  block it and tell the host why.
    const admin = await getSupabaseAdmin();
    const { count, error: countError } = await admin
      .from("guest_kyc_requests")
      .select("id", { count: "exact", head: true })
      .eq("consent_form_id", id)
      .eq("tenant_id", tenantId);

    if (countError) {
      log.error("Failed to count KYC requests for consent form", countError, {
        formId: id,
        tenantId,
      });
      return NextResponse.json(
        { error: "Could not verify whether this form is in use" },
        { status: 500 }
      );
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            `This consent form is referenced by ${count} KYC request(s) and cannot be deleted. ` +
            "Deactivate it instead, or delete the associated KYC requests first.",
        },
        { status: 409 }
      );
    }

    // Safe to delete  -  no KYC requests reference this form
    const { error: deleteError } = await admin
      .from("consent_forms")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      log.error("Failed to delete consent form", deleteError, {
        formId: id,
        tenantId,
      });
      return NextResponse.json(
        { error: deleteError.message ?? "Failed to delete consent form" },
        { status: 500 }
      );
    }

    log.info("Consent form deleted", { formId: id, tenantId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    log.error("DELETE /api/kyc/consent-forms/[id] failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
