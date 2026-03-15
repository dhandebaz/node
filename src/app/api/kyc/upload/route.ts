import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { geminiService } from "@/lib/services/geminiService";

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

    const formData = await req.formData();
    const file = formData.get("file");
    const tenantIdFromBody = formData.get("tenantId");
    const resolvedTenantId =
      (typeof tenantIdFromBody === "string" && tenantIdFromBody) ||
      (await requireActiveTenant());

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const verification = await geminiService.verifyDocument(base64, file.type);
    if (!verification.isValid) {
      return NextResponse.json(
        {
          error:
            verification.reason ||
            "Could not verify document. Please upload a clearer photo.",
        },
        { status: 400 },
      );
    }

    const extension =
      file.name.includes(".")
        ? file.name.split(".").pop()
        : file.type.split("/")[1] || "bin";
    const objectName = `${crypto.randomUUID()}.${extension}`;
    const storagePath = `kyc/${resolvedTenantId}/${user.id}/${objectName}`;

    const { error: uploadError } = await admin.storage
      .from("kyc")
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Upload failed" },
        { status: 500 },
      );
    }

    const normalizedType =
      verification.documentType === "PAN"
        ? "pan"
        : verification.documentType === "AADHAAR"
          ? "aadhaar"
          : "business_license";

    const extractedData = {
      name: verification.details?.name || "",
      dob: verification.details?.dob || "",
      document_number: verification.details?.idNumber || "",
      address: verification.details?.address || "",
      document_type: verification.documentType,
      confidence: verification.confidence,
    };

    const { data: doc, error: docError } = await admin
      .from("kyc_documents")
      .insert({
        tenant_id: resolvedTenantId,
        user_id: user.id,
        document_type: normalizedType,
        file_path: storagePath,
        extracted_data: extractedData,
        status: "processed",
      })
      .select("id")
      .single();

    if (docError) {
      return NextResponse.json(
        { error: docError.message || "Failed to store document record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      filePath: storagePath,
      extractedData,
      documentId: doc?.id || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    if (message.includes("Active Tenant Context Missing")) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
