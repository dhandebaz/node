import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { AppError, ErrorCode } from "@/lib/errors";
import { getAppUrl } from "@/lib/runtime-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KycRequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "expired"
  | "rejected";

export type GuestDocumentType =
  | "aadhaar"
  | "pan"
  | "passport"
  | "driving_license"
  | "voter_id"
  | "other";

export type DocumentVerificationStatus =
  | "pending"
  | "ai_processed"
  | "accepted"
  | "rejected";

export interface ConsentForm {
  id: string;
  tenant_id: string;
  created_by: string | null;
  title: string;
  body_markdown: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestKycRequest {
  id: string;
  tenant_id: string;
  consent_form_id: string | null;
  booking_id: string | null;
  token: string;
  token_expires_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  booking_reference: string | null;
  status: KycRequestStatus;
  credits_charged: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestDocument {
  id: string;
  kyc_request_id: string;
  tenant_id: string;
  document_type: GuestDocumentType;
  front_image_path: string;
  back_image_path: string | null;
  extracted_data: Record<string, unknown>;
  aadhaar_last4: string | null;
  verification_status: DocumentVerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestConsentSignature {
  id: string;
  kyc_request_id: string;
  consent_form_id: string | null;
  tenant_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  signer_ip: string;
  signer_user_agent: string;
  signed_at: string;
  signature_base64: string | null;
  pdf_storage_path: string;
  pdf_sha256: string;
  pdf_size_bytes: number | null;
  consent_text_snapshot: string;
  consent_form_version: string | null;
  created_at: string;
}

export interface KycRequestDetail extends GuestKycRequest {
  documents: GuestDocument[];
  signature: GuestConsentSignature | null;
}

export interface GuestPortalData {
  request_id: string;
  tenant_id: string;
  tenant_name: string;
  status: KycRequestStatus;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  booking_reference: string | null;
  consent_form: {
    id: string;
    title: string;
    body: string;
    version: string;
  } | null;
}

// ─── Aadhaar masking ──────────────────────────────────────────────────────────
//
// TypeScript mirror of the DB mask_aadhaar() PostgreSQL function.
// Both implementations MUST produce identical output so that the
// application layer and the DB layer agree on what "masked" means.
//
// Input  : raw Aadhaar string in any format ("123456789012" / "1234 5678 9012")
// Output : "XXXX XXXX NNNN"  where NNNN = last 4 digits, or null for invalid input.
//
// This function MUST be called before persisting any Aadhaar number.
// The raw 12-digit number must never reach the database.

export function maskAadhaar(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length !== 12) return null;
  return "XXXX XXXX " + digits.slice(8, 12);
}

// ─── KycService ───────────────────────────────────────────────────────────────

export class KycService {
  // ══════════════════════════════════════════════════════════════════════════
  // CONSENT FORMS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Returns all consent forms for a tenant, newest first.
   */
  static async listConsentForms(tenantId: string): Promise<ConsentForm[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("consent_forms")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      log.error("Failed to list consent forms", error, { tenantId });
      return [];
    }
    return (data ?? []) as ConsentForm[];
  }

  /**
   * Returns the currently active consent form for a tenant, or null if none exists.
   */
  static async getActiveConsentForm(
    tenantId: string,
  ): Promise<ConsentForm | null> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("consent_forms")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      log.error("Failed to get active consent form", error, { tenantId });
      return null;
    }
    return (data ?? null) as ConsentForm | null;
  }

  /**
   * Creates a new consent form and marks it as the active form for the tenant.
   * Any previously active form is deactivated in the same operation.
   */
  static async createConsentForm(
    tenantId: string,
    userId: string,
    data: { title: string; body_markdown: string; version?: string },
  ): Promise<ConsentForm> {
    const admin = await getSupabaseAdmin();

    // Deactivate all existing active forms before creating the new one.
    // We do this first so there is at most one active form after this call.
    await admin
      .from("consent_forms")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    const { data: form, error } = await admin
      .from("consent_forms")
      .insert({
        tenant_id: tenantId,
        created_by: userId,
        title: data.title,
        body_markdown: data.body_markdown,
        version: data.version ?? "1",
        is_active: true,
      })
      .select()
      .single();

    if (error || !form) {
      log.error("Failed to create consent form", error, { tenantId });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to create consent form",
      );
    }
    return form as ConsentForm;
  }

  /**
   * Updates fields on an existing consent form.
   * If is_active is being set to true, all other forms for the tenant
   * are deactivated first.
   */
  static async updateConsentForm(
    id: string,
    tenantId: string,
    data: Partial<
      Pick<ConsentForm, "title" | "body_markdown" | "version" | "is_active">
    >,
  ): Promise<ConsentForm> {
    const admin = await getSupabaseAdmin();

    if (data.is_active === true) {
      await admin
        .from("consent_forms")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .neq("id", id)
        .eq("is_active", true);
    }

    const { data: form, error } = await admin
      .from("consent_forms")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error || !form) {
      log.error("Failed to update consent form", error, { id, tenantId });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to update consent form",
      );
    }
    return form as ConsentForm;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GUEST KYC REQUESTS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Creates a new KYC request for a guest. If no consent_form_id is supplied,
   * the tenant's currently active form is attached automatically.
   * Returns the full row including the generated token.
   */
  static async createKycRequest(
    tenantId: string,
    data: {
      guest_name?: string;
      guest_email?: string;
      guest_phone?: string;
      booking_reference?: string;
      booking_id?: string;
      consent_form_id?: string;
    },
  ): Promise<GuestKycRequest> {
    const admin = await getSupabaseAdmin();

    let consentFormId = data.consent_form_id ?? null;
    if (!consentFormId) {
      const activeForm = await this.getActiveConsentForm(tenantId);
      consentFormId = activeForm?.id ?? null;
    }

    const { data: request, error } = await admin
      .from("guest_kyc_requests")
      .insert({
        tenant_id: tenantId,
        consent_form_id: consentFormId,
        booking_id: data.booking_id ?? null,
        guest_name: data.guest_name ?? null,
        guest_email: data.guest_email ?? null,
        guest_phone: data.guest_phone ?? null,
        booking_reference: data.booking_reference ?? null,
      } as any)
      .select()
      .single();

    if (error || !request) {
      log.error("Failed to create KYC request", error, { tenantId });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to create KYC request",
      );
    }
    return request as GuestKycRequest;
  }

  /**
   * Returns all KYC requests for a tenant, newest first.
   * Optionally filtered by status and/or limited in count.
   */
  static async listKycRequests(
    tenantId: string,
    options?: { status?: KycRequestStatus; limit?: number },
  ): Promise<GuestKycRequest[]> {
    const supabase = await getSupabaseServer();
    let query = supabase
      .from("guest_kyc_requests")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (options?.status) query = query.eq("status", options.status);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) {
      log.error("Failed to list KYC requests", error, { tenantId });
      return [];
    }
    return (data ?? []) as GuestKycRequest[];
  }

  /**
   * Returns a single KYC request with its uploaded documents and consent
   * signature (if any). Returns null if the request does not belong to
   * the given tenant.
   */
  static async getKycRequestById(
    id: string,
    tenantId: string,
  ): Promise<KycRequestDetail | null> {
    const supabase = await getSupabaseServer();

    const { data: request, error } = await supabase
      .from("guest_kyc_requests")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !request) return null;

    const [{ data: documents }, { data: signature }] = await Promise.all([
      supabase
        .from("guest_documents")
        .select("*")
        .eq("kyc_request_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("guest_consent_signatures")
        .select("*")
        .eq("kyc_request_id", id)
        .maybeSingle(),
    ]);

    return {
      ...(request as GuestKycRequest),
      documents: (documents ?? []) as GuestDocument[],
      signature: (signature ?? null) as GuestConsentSignature | null,
    };
  }

  /**
   * Deletes a KYC request. Only requests in non-terminal states
   * (pending, expired, rejected) can be deleted to preserve audit trails.
   */
  static async deleteKycRequest(id: string, tenantId: string): Promise<void> {
    const admin = await getSupabaseAdmin();
    const { error } = await admin
      .from("guest_kyc_requests")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .in("status", ["pending", "expired", "rejected"]);

    if (error) {
      log.error("Failed to delete KYC request", error, { id, tenantId });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to delete KYC request. Completed requests cannot be deleted.",
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GUEST DOCUMENTS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Persists a guest document record after the image files have been uploaded
   * to Supabase Storage.
   *
   * AADHAAR COMPLIANCE:
   *   If the document type is 'aadhaar', maskAadhaar() is called on
   *   extracted_data.id_number before the row is written. If the number is
   *   invalid (not 12 digits), the id_number key is stripped entirely.
   *   The raw Aadhaar number MUST NOT reach the database.
   */
  static async saveGuestDocument(
    requestId: string,
    tenantId: string,
    data: {
      document_type: GuestDocumentType;
      front_image_path: string;
      back_image_path?: string;
      extracted_data: Record<string, unknown>;
    },
  ): Promise<GuestDocument> {
    const admin = await getSupabaseAdmin();

    // ── Aadhaar masking enforcement ───────────────────────────────
    const safeExtractedData: Record<string, unknown> = {
      ...data.extracted_data,
    };
    let aadhaarLast4: string | null = null;

    if (data.document_type === "aadhaar" && safeExtractedData.id_number) {
      const masked = maskAadhaar(String(safeExtractedData.id_number));
      if (masked === null) {
        // The extracted number is not a valid 12-digit Aadhaar.
        // Strip it entirely rather than store a raw partial number.
        delete safeExtractedData.id_number;
        log.warn("Invalid Aadhaar number stripped before DB write", {
          requestId,
          tenantId,
        });
      } else {
        safeExtractedData.id_number = masked;
        aadhaarLast4 = masked.slice(-4); // last 4 digits only
      }
    }

    // Transition request from pending → in_progress on the first document upload.
    // We only do this if the current status is 'pending' to avoid overwriting
    // 'in_progress' or later states on subsequent uploads.
    await admin
      .from("guest_kyc_requests")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("status", "pending");

    const { data: doc, error } = await admin
      .from("guest_documents")
      .insert({
        kyc_request_id: requestId,
        tenant_id: tenantId,
        document_type: data.document_type,
        front_image_path: data.front_image_path,
        back_image_path: data.back_image_path ?? null,
        extracted_data: safeExtractedData as any,
        aadhaar_last4: aadhaarLast4,
        verification_status: "ai_processed",
      } as any)
      .select()
      .single();

    if (error || !doc) {
      log.error("Failed to save guest document", error, {
        requestId,
        tenantId,
      });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to save document record",
      );
    }
    return doc as GuestDocument;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Builds the full public URL for a guest KYC link.
   * Falls back to localhost:3000 in development if NEXT_PUBLIC_APP_URL is unset.
   */
  static getKycLink(token: string): string {
    return `${getAppUrl()}/guest-id/${token}`;
  }

  /**
   * Generates a signed download URL for a consent PDF stored in the
   * private kyc-consents bucket. URL is valid for 1 hour.
   */
  static async getSignedPdfUrl(storagePath: string): Promise<string | null> {
    try {
      const admin = await getSupabaseAdmin();
      const { data, error } = await admin.storage
        .from("kyc-consents")
        .createSignedUrl(storagePath, 3600); // 1 hour

      if (error || !data?.signedUrl) {
        log.error("Failed to create signed URL for KYC PDF", error, {
          storagePath,
        });
        return null;
      }
      return data.signedUrl;
    } catch (err) {
      log.error("Unexpected error generating signed URL", err as Error, {
        storagePath,
      });
      return null;
    }
  }
}
