import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";
import { KycService, maskAadhaar, GuestDocumentType } from "@/lib/services/kycService";
import { log } from "@/lib/logger";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function uploadImageToStorage(
  admin: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  tenantId: string,
  requestId: string,
  file: File,
  suffix: string = ""
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext =
    file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase()
      : file.type.split("/")[1] ?? "jpg";

  const uuid = crypto.randomUUID();
  const objectName = suffix ? `${uuid}-${suffix}.${ext}` : `${uuid}.${ext}`;
  const storagePath = `${tenantId}/${requestId}/${objectName}`;

  const { error } = await admin.storage
    .from("kyc-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return storagePath;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // ── Parse multipart form data ───────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400 }
      );
    }

    const frontFile = formData.get("file") as File | null;
    const backFile = formData.get("back_file") as File | null;
    const requestId = (formData.get("request_id") as string | null)?.trim() ?? "";
    const tenantId = (formData.get("tenant_id") as string | null)?.trim() ?? "";
    const rawDocType = (formData.get("document_type") as string | null)?.trim() ?? "other";

    // ── Validate required fields ────────────────────────────────
    if (!frontFile || !(frontFile instanceof File) || frontFile.size === 0) {
      return NextResponse.json(
        { error: "A front image file is required" },
        { status: 400 }
      );
    }

    if (!isValidUuid(requestId)) {
      return NextResponse.json(
        { error: "request_id must be a valid UUID" },
        { status: 400 }
      );
    }

    if (!isValidUuid(tenantId)) {
      return NextResponse.json(
        { error: "tenant_id must be a valid UUID" },
        { status: 400 }
      );
    }

    // ── Validate file type and size ─────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(frontFile.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${frontFile.type}. Please upload a JPEG, PNG, or WebP image.`,
        },
        { status: 400 }
      );
    }

    if (frontFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must not exceed 10 MB" },
        { status: 400 }
      );
    }

    // ── Validate token against the request_id ──────────────────
    // Calls the SECURITY DEFINER RPC to confirm the token is valid
    // and that it corresponds to the supplied request_id + tenant_id.
    const admin = await getSupabaseAdmin();

    const { data: portalData, error: rpcError } = await admin.rpc(
      "get_kyc_request_by_token",
      { p_token: token }
    );

    if (rpcError || !portalData || portalData.success === false) {
      const code = portalData?.code ?? "UNKNOWN";
      log.warn("Document upload rejected  -  invalid token", { token, code });

      if (code === "TOKEN_EXPIRED") {
        return NextResponse.json(
          { error: "This verification link has expired.", code },
          { status: 410 }
        );
      }
      if (code === "ALREADY_COMPLETED") {
        return NextResponse.json(
          { error: "KYC already completed for this link.", code },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Invalid or expired verification link.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Confirm the token belongs to the exact request_id + tenant_id supplied
    if (
      portalData.request_id !== requestId ||
      portalData.tenant_id !== tenantId
    ) {
      log.warn("Document upload rejected  -  token/request mismatch", {
        token,
        requestId,
        tenantId,
      });
      return NextResponse.json(
        { error: "Token does not match the supplied request or tenant" },
        { status: 403 }
      );
    }

    // ── Upload front image to storage ───────────────────────────
    const frontImagePath = await uploadImageToStorage(
      admin,
      tenantId,
      requestId,
      frontFile,
      "front"
    );

    let backImagePath: string | undefined;
    if (backFile instanceof File && backFile.size > 0) {
      if (ALLOWED_MIME_TYPES.includes(backFile.type) && backFile.size <= MAX_FILE_SIZE_BYTES) {
        backImagePath = await uploadImageToStorage(
          admin,
          tenantId,
          requestId,
          backFile,
          "back"
        );
      } else {
        log.warn("Back image skipped due to invalid type or size", {
          requestId,
          type: backFile.type,
          size: backFile.size,
        });
      }
    }

    // ── Run Gemini OCR on the front image ───────────────────────
    const frontArrayBuffer = await frontFile.arrayBuffer();
    const base64 = Buffer.from(frontArrayBuffer).toString("base64");

    const ocrResult = await geminiService.verifyDocument(base64, frontFile.type);

    // ── Determine document type ─────────────────────────────────
    // Prefer the type from Gemini's detection; fall back to what the guest selected.
    const validDocTypes: GuestDocumentType[] = [
      "aadhaar",
      "pan",
      "passport",
      "driving_license",
      "voter_id",
      "other",
    ];

    let detectedType: GuestDocumentType = validDocTypes.includes(
      rawDocType as GuestDocumentType
    )
      ? (rawDocType as GuestDocumentType)
      : "other";

    if (ocrResult.documentType === "AADHAAR") detectedType = "aadhaar";
    else if (ocrResult.documentType === "PAN") detectedType = "pan";

    // ── Build extracted data with Aadhaar masking ───────────────
    const extractedData: Record<string, unknown> = {
      name: ocrResult.details?.name ?? null,
      dob: ocrResult.details?.dob ?? null,
      address: ocrResult.details?.address ?? null,
      document_type: ocrResult.documentType,
      confidence: ocrResult.confidence,
      is_valid: ocrResult.isValid,
    };

    // AADHAAR COMPLIANCE: mask the first 8 digits before storing.
    // The raw 12-digit Aadhaar number must never be persisted.
    if (ocrResult.details?.idNumber) {
      if (detectedType === "aadhaar" || ocrResult.documentType === "AADHAAR") {
        const masked = maskAadhaar(ocrResult.details.idNumber);
        if (masked === null) {
          // Invalid Aadhaar format  -  omit rather than store a bad value
          log.warn("Gemini returned an invalid Aadhaar number  -  stripped", {
            requestId,
            tenantId,
          });
          extractedData.id_number = null;
        } else {
          extractedData.id_number = masked;
        }
      } else {
        // Non-Aadhaar documents (PAN, Passport, etc.) are stored as-is
        extractedData.id_number = ocrResult.details.idNumber;
      }
    }

    // ── Persist the document record ─────────────────────────────
    // saveGuestDocument also enforces Aadhaar masking as a second layer of defence.
    const doc = await KycService.saveGuestDocument(requestId, tenantId, {
      document_type: detectedType,
      front_image_path: frontImagePath,
      back_image_path: backImagePath,
      extracted_data: extractedData,
    });

    log.info("Guest document uploaded and saved", {
      documentId: doc.id,
      requestId,
      tenantId,
      documentType: detectedType,
      isValid: ocrResult.isValid,
    });

    return NextResponse.json(
      {
        success: true,
        document_id: doc.id,
        document_type: detectedType,
        extracted_data: {
          name: extractedData.name,
          id_number: extractedData.id_number,
          dob: extractedData.dob,
          is_valid: extractedData.is_valid,
          confidence: extractedData.confidence,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    log.error("POST /api/kyc/[token]/documents failed", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
