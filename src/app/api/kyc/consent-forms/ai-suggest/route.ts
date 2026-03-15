import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { generateConsentFormAction } from "@/app/actions/kyc";
import { log } from "@/lib/logger";

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

    await requireActiveTenant();

    const body = await req.json().catch(() => ({}));
    const { business_name, business_type, property_description } = body;

    if (!business_name || typeof business_name !== "string" || !business_name.trim()) {
      return NextResponse.json(
        { error: "business_name is required" },
        { status: 400 }
      );
    }

    if (!business_type || typeof business_type !== "string" || !business_type.trim()) {
      return NextResponse.json(
        { error: "business_type is required" },
        { status: 400 }
      );
    }

    const result = await generateConsentFormAction({
      businessName: business_name.trim(),
      businessType: business_type.trim(),
      propertyDescription:
        typeof property_description === "string" && property_description.trim()
          ? property_description.trim()
          : undefined,
    });

    log.info("AI consent form generated", {
      userId: user.id,
      businessName: business_name,
      businessType: business_type,
    });

    return NextResponse.json({
      title: result.title,
      body_markdown: result.body_markdown,
    });
  } catch (err: any) {
    log.error("POST /api/kyc/consent-forms/ai-suggest failed", err);

    // Surface Gemini-specific errors with a clearer message
    if (
      err.message?.includes("API key") ||
      err.message?.includes("Gemini")
    ) {
      return NextResponse.json(
        { error: "AI generation is not available. Please check that a Gemini API key is configured in Settings." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: err.message ?? "Failed to generate consent form" },
      { status: 500 }
    );
  }
}
