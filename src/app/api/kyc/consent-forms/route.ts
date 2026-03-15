import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { KycService } from "@/lib/services/kycService";
import { getSession } from "@/lib/auth/session";
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

    const [forms, active] = await Promise.all([
      KycService.listConsentForms(tenantId),
      KycService.getActiveConsentForm(tenantId),
    ]);

    return NextResponse.json({ forms, active });
  } catch (err: any) {
    log.error("GET /api/kyc/consent-forms failed", err);
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
    const { title, body_markdown, version } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    if (
      !body_markdown ||
      typeof body_markdown !== "string" ||
      !body_markdown.trim()
    ) {
      return NextResponse.json(
        { error: "body_markdown is required" },
        { status: 400 }
      );
    }

    const form = await KycService.createConsentForm(tenantId, user.id, {
      title: title.trim(),
      body_markdown: body_markdown.trim(),
      version: typeof version === "string" && version.trim() ? version.trim() : "1",
    });

    log.info("Consent form created", {
      formId: form.id,
      tenantId,
      userId: user.id,
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (err: any) {
    log.error("POST /api/kyc/consent-forms failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
