"use server";

import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";
import { KycService, maskAadhaar } from "@/lib/services/kycService";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSession } from "@/lib/auth/session";
import { log } from "@/lib/logger";

// ─── AI Document Extraction ───────────────────────────────────────────────────
//
// Used by both the host dashboard (isPublic = false) and the guest portal
// (isPublic = true via the server-side API route) to run Gemini OCR on an
// uploaded identity document.
//
// AADHAAR COMPLIANCE:
//   If the detected document is an Aadhaar card, the id_number returned
//   to the caller is always the masked form ("XXXX XXXX NNNN").
//   The raw 12-digit number is never returned or stored.

export async function extractKycDataAction(
  fileBase64: string,
  mimeType: string,
  isPublic: boolean = false,
) {
  const supabase = isPublic
    ? await getSupabaseAdmin()
    : await getSupabaseServer();

  let tenantId: string | null = null;
  let userId: string | null = null;

  if (!isPublic) {
    tenantId = await requireActiveTenant();
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized: No session");
    userId = session.userId;
  }

  // Run Gemini Vision OCR
  const result = await geminiService.verifyDocument(fileBase64, mimeType);

  if (!result.isValid) {
    throw new Error(
      result.reason ??
        "Could not verify document. Please upload a clearer photo.",
    );
  }

  // Enforce Aadhaar masking on the extracted id_number before returning it
  let safeIdNumber = result.details?.idNumber ?? null;
  if (result.documentType === "AADHAAR" && safeIdNumber) {
    const masked = maskAadhaar(safeIdNumber);
    if (masked === null) {
      // Not a valid 12-digit number — strip rather than return a partial
      safeIdNumber = null;
      log.warn("extractKycDataAction: invalid Aadhaar number stripped", {
        tenantId,
      });
    } else {
      safeIdNumber = masked;
    }
  }

  const safeDetails = result.details
    ? { ...result.details, idNumber: safeIdNumber }
    : null;

  // Persist a kyc_documents record for the host's own documents (non-public flow)
  let documentId: string | null = null;
  if (tenantId && userId && !isPublic) {
    const normalizedType =
      result.documentType === "PAN"
        ? "pan"
        : result.documentType === "AADHAAR"
          ? "aadhaar"
          : "business_license";

    const { data: doc, error } = await supabase
      .from("kyc_documents")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        document_type: normalizedType,
        file_path: "ai_extracted_temp",
        extracted_data: safeDetails ?? {},
        status: "processed",
      })
      .select("id")
      .single();

    if (!error && doc) documentId = doc.id;
  }

  return {
    success: true,
    documentType: result.documentType,
    details: safeDetails,
    documentId,
  };
}

// ─── Guest Check-in ───────────────────────────────────────────────────────────
//
// Records a completed guest check-in (name, contact details, arrival time)
// and marks the associated payment link as paid.
// This action is still used by the legacy guest check-in flow (guest_checkins
// table). It is separate from the new Nodebase KYC consent-signing flow.

export async function completeGuestCheckinAction(data: {
  linkId: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  documentId?: string;
  arrivalTime?: string;
}) {
  const supabase = await getSupabaseAdmin();

  const { data: checkin, error: checkinError } = await supabase
    .from("guest_checkins")
    .insert({
      tenant_id: data.tenantId,
      payment_link_id: data.linkId,
      guest_name: data.name,
      guest_email: data.email,
      guest_phone: data.phone,
      arrival_time: data.arrivalTime,
      id_verified: !!data.idNumber,
      id_document_id: data.documentId ?? null,
      status: "completed",
    })
    .select()
    .single();

  if (checkinError) {
    log.error("Failed to create guest check-in", checkinError, {
      tenantId: data.tenantId,
    });
    throw new Error("Failed to save check-in details");
  }

  const { error: linkError } = await supabase
    .from("payment_links")
    .update({ status: "paid" })
    .eq("id", data.linkId);

  if (linkError) {
    log.error("Failed to update payment link status", linkError, {
      linkId: data.linkId,
    });
  }

  return { success: true, checkinId: checkin.id };
}

// ─── Consent Form AI Suggestion ───────────────────────────────────────────────
//
// Generates a ready-to-use consent form body using Gemini.
// Called by the host dashboard when the host clicks "Generate with AI".
// Returns { title, body_markdown } which the host can then edit before saving.

export async function generateConsentFormAction(data: {
  businessName: string;
  businessType: string;
  propertyDescription?: string;
}): Promise<{ title: string; body_markdown: string }> {
  const tenantId = await requireActiveTenant();
  if (!tenantId) throw new Error("Unauthorized");

  const settings = await import("@/lib/services/settingsService").then((m) =>
    m.settingsService.getSettings(),
  );
  const apiKey = (await settings).api.geminiApiKey;
  if (!apiKey) throw new Error("Gemini API key is not configured");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a legal document assistant specialising in Indian property rental compliance.

Generate a guest identity verification and consent form for the following business:
- Business name: ${data.businessName}
- Business type: ${data.businessType}
- Property / service description: ${data.propertyDescription ?? "short-term rental property"}

The form must cover:
1. Purpose of identity collection (compliance with Section 14 of the Registration of Foreigners Act, 1946 and local police verification requirements)
2. What documents are being collected (Aadhaar / PAN / Passport)
3. That Aadhaar numbers will be stored in masked form only
4. How the data will be used and retained (30-day retention after checkout)
5. Guest consent to electronic signature being legally binding under the Indian IT Act 2000
6. Data protection assurance (not shared with third parties except law enforcement if required)

Format the output as a JSON object with exactly two keys:
{
  "title": "Short form title (max 10 words)",
  "body_markdown": "Full consent form body in Markdown. Use ## for section headings. Keep it under 400 words. Plain, clear language."
}

Output ONLY the JSON object. No markdown fences, no extra text.
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed: { title: string; body_markdown: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    // Gemini occasionally wraps the JSON in markdown fences — strip them
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  }

  if (!parsed.title || !parsed.body_markdown) {
    throw new Error("AI returned an unexpected response format");
  }

  return {
    title: parsed.title,
    body_markdown: parsed.body_markdown,
  };
}

// ─── Create KYC Request (Server Action wrapper) ───────────────────────────────
//
// Thin wrapper around KycService.createKycRequest for use in Server Components
// or form actions. Returns the request and the shareable guest link.

export async function createKycRequestAction(data: {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  booking_reference?: string;
  booking_id?: string;
}) {
  const tenantId = await requireActiveTenant();

  const request = await KycService.createKycRequest(tenantId, data);
  const link = KycService.getKycLink(request.token);

  log.info("KYC request created", {
    requestId: request.id,
    tenantId,
    guestName: data.guest_name,
  });

  return { success: true, request, link };
}
