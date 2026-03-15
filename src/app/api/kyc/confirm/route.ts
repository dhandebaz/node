import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, extractedData, documentPath, documentId } = body;
    const resolvedTenantId =
      (typeof tenantId === "string" && tenantId) ||
      (await requireActiveTenant());

    if (!extractedData) {
      return NextResponse.json({ error: "Data required" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", resolvedTenantId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin
      .from("tenants")
      .update({
        kyc_extracted_data: extractedData,
        kyc_document_path: documentPath,
        kyc_status: "pending",
      })
      .eq("id", resolvedTenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (typeof documentId === "string" && documentId) {
      const { error: docError } = await admin
        .from("kyc_documents")
        .update({ status: "verified" })
        .eq("id", documentId)
        .eq("tenant_id", resolvedTenantId);

      if (docError) {
        return NextResponse.json({ error: docError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    if (message.includes("Active Tenant Context Missing")) {
      return NextResponse.json(
        { error: "Tenant ID required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
