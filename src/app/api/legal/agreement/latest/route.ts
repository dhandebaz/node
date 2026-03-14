import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: agreement } = await supabase
      .from("tenant_legal_agreements")
      .select("id, tenant_id, version, file_path, signed_at")
      .eq("tenant_id", tenantId)
      .order("signed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let filePath = agreement?.file_path || null;
    let version = agreement?.version || null;
    let signedAt = agreement?.signed_at || null;

    if (!filePath) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("legal_agreement_path")
        .eq("id", tenantId)
        .maybeSingle();
      filePath = tenant?.legal_agreement_path || null;
    }

    if (!filePath) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const { data: signed, error: signedError } = await admin.storage
      .from("legal")
      .createSignedUrl(filePath, 60);

    if (signedError || !signed?.signedUrl) {
      return NextResponse.json({ error: signedError?.message || "Failed to generate download link" }, { status: 500 });
    }

    const filename = filePath.split("/").pop() || "agreement.pdf";

    return NextResponse.json(
      { url: signed.signedUrl, filename, version, signedAt },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    if (String(error?.message || "").includes("Active Tenant Context Missing")) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || "Failed to fetch agreement" }, { status: 500 });
  }
}

