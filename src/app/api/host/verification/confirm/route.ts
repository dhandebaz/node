import { NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";

function isPan(value: string | null | undefined): value is string {
  return !!value && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
}

function isMaskedAadhaar(value: string | null | undefined): value is string {
  return !!value && /^XXXX XXXX [0-9]{4}$/.test(value);
}

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

    const { data: tenant } = await supabase
      .from("tenants")
      .select("tax_id")
      .eq("id", resolvedTenantId)
      .single();

    const documentType = String(extractedData.document_type || "").toUpperCase();
    const documentNumber =
      typeof extractedData.document_number === "string"
        ? extractedData.document_number.trim().toUpperCase()
        : null;
    const taxId =
      typeof tenant?.tax_id === "string" ? tenant.tax_id.trim().toUpperCase() : null;

    const updatePayload: Record<string, unknown> = {
      kyc_extracted_data: extractedData,
      kyc_document_path: documentPath,
      kyc_status: "pending",
      updated_at: new Date().toISOString(),
    };

    if (documentType === "PAN" && isPan(documentNumber)) {
      updatePayload.pan_number = documentNumber;
    } else if (isPan(taxId)) {
      updatePayload.pan_number = taxId;
    }

    if (documentType === "AADHAAR" && isMaskedAadhaar(documentNumber)) {
      updatePayload.aadhaar_number = documentNumber;
    }

    const { error } = await admin
      .from("tenants")
      .update(updatePayload as any)
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

    return NextResponse.json({
      success: true,
      identifiers: {
        pan_number:
          typeof updatePayload.pan_number === "string"
            ? updatePayload.pan_number
            : null,
        aadhaar_number:
          typeof updatePayload.aadhaar_number === "string"
            ? updatePayload.aadhaar_number
            : null,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    if (message.includes("Active Tenant Context Missing")) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
