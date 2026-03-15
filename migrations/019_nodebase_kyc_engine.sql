-- ================================================================
-- Migration 019: Nodebase KYC Engine
-- ================================================================
-- Replaces all Cashfree-based KYC with an internal, fully
-- India-compliant guest identity verification and consent
-- signing system.
--
-- What this migration creates:
--   Tables  : consent_forms, guest_kyc_requests, guest_documents,
--             guest_consent_signatures
--   Functions: mask_aadhaar(), complete_guest_kyc_v1(),
--              get_kyc_request_by_token()
--   RLS      : Full tenant isolation on all new tables.
--              Guest-portal access via SECURITY DEFINER RPCs only.
--   Indexes  : Hot-path indexes for token lookups and tenant queries.
--   Storage  : kyc-documents bucket (ID images),
--              kyc-consents bucket (signed PDFs)
--
-- Legal compliance notes (India):
--   • guest_consent_signatures captures signer_ip, signer_user_agent,
--     and signed_at — the three fields required for e-signature
--     admissibility under the Indian IT Act 2000.
--   • pdf_sha256 (SHA-256 of the generated PDF) provides
--     non-repudiation: any tampering with the stored file can be
--     detected by re-hashing and comparing against this value.
--   • Aadhaar numbers are NEVER stored in full. mask_aadhaar()
--     must be called before any Aadhaar data is persisted, reducing
--     the first 8 digits to 'XXXX XXXX' per MeitY guidelines.
-- ================================================================


-- ================================================================
-- SECTION 1: PREREQUISITES & DEPRECATIONS
-- ================================================================

-- pgcrypto is needed for gen_random_bytes() used in the token default.
-- Supabase ships with it pre-installed; this is a safety net.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ── Deprecate the old Cashfree business-owner KYC table ──────────
-- We keep the rows (historical data) but stop writing to it.
-- The new system uses guest_documents for all document storage.
COMMENT ON TABLE public.kyc_documents IS
  'DEPRECATED (Migration 019): Previously used for Cashfree-based '
  'business-owner PAN/Aadhaar verification. Retained for historical '
  'data integrity. No new rows will be inserted by the application. '
  'All new guest KYC uses the guest_documents table instead.';


-- ── Drop the Cashfree-only audit table ───────────────────────────
-- kyc_verifications was only ever written to by verifyCashfreeKYC().
-- It has no value without the Cashfree provider.
DROP TABLE IF EXISTS public.kyc_verifications CASCADE;


-- ================================================================
-- SECTION 2: consent_forms
-- ================================================================
-- A Host creates one or more consent form templates. The body text
-- can be written manually or generated with AI suggestions. The
-- active form is attached to every guest_kyc_request for that tenant.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.consent_forms (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by   UUID                 REFERENCES auth.users(id)    ON DELETE SET NULL,

  -- Form content (Markdown allowed; rendered in the guest portal)
  title         TEXT        NOT NULL,
  body_markdown TEXT        NOT NULL,

  -- Version string lets Hosts track revisions (e.g. "1", "2", "2024-07-01")
  version TEXT NOT NULL DEFAULT '1',

  -- Only one form should be marked active per tenant at any time.
  -- The application enforces this; the DB does not add a partial-unique
  -- index here so that deactivation and activation can happen in the
  -- same transaction without transient uniqueness violations.
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.consent_forms               IS 'AI-generatable consent form templates created by Hosts.';
COMMENT ON COLUMN public.consent_forms.body_markdown  IS 'Full consent body in Markdown. Rendered in the guest-facing KYC portal.';
COMMENT ON COLUMN public.consent_forms.is_active      IS 'Marks the form currently in use. Hosts should keep only one active form per tenant.';


-- ================================================================
-- SECTION 3: guest_kyc_requests
-- ================================================================
-- Created by the Host when they want to KYC a specific guest.
-- A cryptographically random token is embedded in a link and sent
-- to the guest (via WhatsApp, email, QR code, etc.).
-- The guest does NOT need a Nodebase account to complete the flow.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.guest_kyc_requests (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id)    ON DELETE CASCADE,
  consent_form_id UUID         REFERENCES public.consent_forms(id) ON DELETE SET NULL,
  booking_id      UUID         REFERENCES public.bookings(id)      ON DELETE SET NULL,

  -- ── Secure link token ─────────────────────────────────────────
  -- 32 random bytes → 64-char lowercase hex string (256 bits of entropy).
  -- Never expose this in logs.
  token            TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  -- ── Host-prefilled guest info ──────────────────────────────────
  -- Optional: the Host fills these in when generating the link so
  -- the guest portal can show a personalised greeting.
  guest_name        TEXT,
  guest_email       TEXT,
  guest_phone       TEXT,
  booking_reference TEXT,

  -- ── Lifecycle status ──────────────────────────────────────────
  --   pending      → link sent, guest has not opened it yet
  --   in_progress  → guest has opened the portal and started filling in
  --   completed    → all steps done, PDF signed, ₹5 charged
  --   expired      → token_expires_at has passed without completion
  --   rejected     → Host manually rejected (e.g. fraudulent document)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'rejected')),

  -- Set to TRUE atomically by complete_guest_kyc_v1() after charging.
  -- A safeguard against double-billing on retry.
  credits_charged BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.guest_kyc_requests                IS 'One row per KYC link a Host sends to a guest.';
COMMENT ON COLUMN public.guest_kyc_requests.token          IS '256-bit random hex token. Embedded in the public /kyc/<token> URL.';
COMMENT ON COLUMN public.guest_kyc_requests.credits_charged IS 'TRUE once 5 credits have been atomically deducted via complete_guest_kyc_v1().';


-- ================================================================
-- SECTION 4: guest_documents
-- ================================================================
-- Document images uploaded by the guest during the KYC flow.
--
-- AADHAAR COMPLIANCE:
--   The application MUST call mask_aadhaar() before writing any
--   Aadhaar number into extracted_data. The raw 12-digit Aadhaar
--   number must NEVER be stored anywhere in this table.
--   aadhaar_last4 stores only the final 4 digits for display
--   purposes (e.g. "9012"). A CHECK constraint enforces this.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.guest_documents (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_request_id  UUID NOT NULL REFERENCES public.guest_kyc_requests(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id)             ON DELETE CASCADE,

  -- ── Document classification ───────────────────────────────────
  document_type TEXT NOT NULL
    CHECK (document_type IN (
      'aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'other'
    )),

  -- ── Storage paths (files live in the kyc-documents bucket) ────
  front_image_path TEXT NOT NULL,
  back_image_path  TEXT,           -- Optional for single-sided documents

  -- ── AI-extracted metadata ─────────────────────────────────────
  -- For Aadhaar: the 'id_number' key MUST contain the masked value
  -- ("XXXX XXXX NNNN") produced by mask_aadhaar(). Never the raw number.
  -- For PAN:     the full PAN is acceptable (not covered by masking law).
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Convenience column: last 4 digits of Aadhaar only (e.g. "9012").
  -- NULL for non-Aadhaar documents.
  -- CHECK: must be exactly 4 digits or NULL — never a full Aadhaar number.
  aadhaar_last4 TEXT CHECK (
    aadhaar_last4 IS NULL
    OR aadhaar_last4 ~ '^[0-9]{4}$'
  ),

  -- ── Review status ─────────────────────────────────────────────
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN (
      'pending', 'ai_processed', 'accepted', 'rejected'
    )),
  rejection_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.guest_documents                 IS 'ID document images submitted by a guest during the KYC flow.';
COMMENT ON COLUMN public.guest_documents.extracted_data  IS 'AI-extracted fields. Aadhaar id_number MUST be masked via mask_aadhaar() before insertion.';
COMMENT ON COLUMN public.guest_documents.aadhaar_last4   IS 'Last 4 digits of Aadhaar only (e.g. "9012"). NULL for non-Aadhaar documents. Never store more than 4 digits here.';


-- ================================================================
-- SECTION 5: guest_consent_signatures
-- ================================================================
-- The immutable legal record produced when a guest signs the
-- consent form. This is the source of truth for any dispute.
--
-- INDIA LEGAL COMPLIANCE (IT Act 2000, s.5 read with Schedule II):
--   For an electronic signature to be court-admissible the system
--   must capture and preserve:
--     1. signer_ip          — remote IP of the signing device
--     2. signer_user_agent  — browser/OS fingerprint at signing time
--     3. signed_at          — server-authoritative UTC timestamp
--   All three columns are NOT NULL and have no application-level
--   defaults so they cannot be accidentally omitted.
--
-- NON-REPUDIATION:
--   pdf_sha256 is a SHA-256 hex digest of the PDF bytes as they
--   were when the file was uploaded to the kyc-consents bucket.
--   Any subsequent tampering with the stored file is detectable by
--   re-hashing and comparing against this value.
--   A CHECK constraint enforces the expected hex format.
--
-- IMMUTABILITY:
--   Rows in this table MUST NOT be updated after creation.
--   The application enforces this; consider adding a DB-level
--   trigger if the threat model requires it.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.guest_consent_signatures (
  id             UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_request_id UUID NOT NULL REFERENCES public.guest_kyc_requests(id) ON DELETE CASCADE,
  consent_form_id UUID         REFERENCES public.consent_forms(id)       ON DELETE SET NULL,
  tenant_id      UUID NOT NULL REFERENCES public.tenants(id)             ON DELETE CASCADE,

  -- ── Guest identity (self-reported at signing time) ────────────
  guest_name  TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,

  -- ── LEGAL COMPLIANCE — DO NOT REMOVE OR MAKE NULLABLE ─────────
  signer_ip         TEXT        NOT NULL,  -- e.g. "203.0.113.42" or "2001:db8::1"
  signer_user_agent TEXT        NOT NULL,  -- full User-Agent header string
  signed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- server-side timestamp
  -- ──────────────────────────────────────────────────────────────

  -- Drawn or typed signature captured as a base64-encoded PNG data URI.
  -- Optional: some consent workflows use click-to-agree instead.
  signature_base64 TEXT,

  -- ── PDF artifact ──────────────────────────────────────────────
  -- The generated PDF is stored in the kyc-consents private bucket.
  pdf_storage_path TEXT   NOT NULL,                    -- bucket object path
  pdf_sha256       TEXT   NOT NULL,                    -- non-repudiation anchor
  pdf_size_bytes   BIGINT,

  -- ── Consent text snapshot ─────────────────────────────────────
  -- Verbatim copy of the consent body at the moment of signing.
  -- Stored even if the consent_form template is later edited or
  -- deleted, so the document can always be reconstructed.
  consent_text_snapshot TEXT NOT NULL,
  consent_form_version  TEXT,

  -- Append-only audit; this row must never be updated
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ── Integrity constraints ─────────────────────────────────────
  -- SHA-256 hex digest: exactly 64 lowercase hex characters
  CONSTRAINT chk_pdf_sha256_format
    CHECK (pdf_sha256 ~ '^[a-f0-9]{64}$'),

  -- Prevent storing an empty signer_ip
  CONSTRAINT chk_signer_ip_nonempty
    CHECK (length(trim(signer_ip)) > 0),

  -- Prevent storing an empty signer_user_agent
  CONSTRAINT chk_signer_ua_nonempty
    CHECK (length(trim(signer_user_agent)) > 0)
);

COMMENT ON TABLE  public.guest_consent_signatures                    IS 'Immutable legal record of a guest signing a consent form. Court-admissible under the Indian IT Act 2000.';
COMMENT ON COLUMN public.guest_consent_signatures.signer_ip          IS 'LEGAL REQUIREMENT: IP address of the guest at the moment of signing (from x-forwarded-for or x-real-ip headers).';
COMMENT ON COLUMN public.guest_consent_signatures.signer_user_agent  IS 'LEGAL REQUIREMENT: Full User-Agent header string captured at signing time.';
COMMENT ON COLUMN public.guest_consent_signatures.signed_at          IS 'LEGAL REQUIREMENT: Server-authoritative UTC timestamp of signing. Never use a client-supplied value.';
COMMENT ON COLUMN public.guest_consent_signatures.pdf_sha256         IS 'SHA-256 hex digest of the PDF bytes. Used for non-repudiation — any tampering with the stored file is detectable.';
COMMENT ON COLUMN public.guest_consent_signatures.consent_text_snapshot IS 'Verbatim copy of the consent body at signing time. Preserved independently of the consent_form template.';


-- ================================================================
-- SECTION 6: mask_aadhaar() — Aadhaar masking helper
-- ================================================================
-- Strips all non-digit characters, validates that the result is
-- exactly 12 digits, then returns "XXXX XXXX NNNN" where only the
-- last 4 digits are visible.
--
-- Returns NULL for any input that is NULL or not a valid 12-digit
-- Aadhaar number. The application should treat NULL as a signal
-- that the document number provided is invalid.
--
-- IMMUTABLE + STRICT: can be used safely in expression indexes and
-- generated columns. The STRICT attribute means PostgreSQL will
-- automatically return NULL without calling the body when the
-- argument is NULL.
--
-- Usage:
--   SELECT mask_aadhaar('1234 5678 9012');  →  'XXXX XXXX 9012'
--   SELECT mask_aadhaar('123456789012');    →  'XXXX XXXX 9012'
--   SELECT mask_aadhaar('12345');           →  NULL  (invalid)
--   SELECT mask_aadhaar(NULL);             →  NULL  (STRICT)
-- ================================================================

CREATE OR REPLACE FUNCTION public.mask_aadhaar(p_aadhaar TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_clean TEXT;
BEGIN
  -- Remove spaces, hyphens, dots and any other non-digit characters.
  v_clean := regexp_replace(p_aadhaar, '[^0-9]', '', 'g');

  -- Aadhaar is always exactly 12 digits. Reject anything else.
  IF length(v_clean) <> 12 THEN
    RETURN NULL;
  END IF;

  -- Mask the first 8 digits; expose only the last 4 in standard format.
  -- Format: "XXXX XXXX NNNN"
  RETURN 'XXXX XXXX ' || substring(v_clean FROM 9 FOR 4);
END;
$$;

COMMENT ON FUNCTION public.mask_aadhaar(TEXT) IS
  'Returns an Aadhaar number in "XXXX XXXX NNNN" masked format. '
  'The first 8 digits are always hidden per MeitY guidelines. '
  'Returns NULL if the input is NULL or not a valid 12-digit Aadhaar. '
  'MUST be called before storing any Aadhaar number in the database.';


-- ================================================================
-- SECTION 7: complete_guest_kyc_v1() — Atomic KYC completion RPC
-- ================================================================
-- Called by the server-side API once the guest has:
--   1. Uploaded their ID document(s)         → guest_documents rows exist
--   2. Signed the consent form               → PDF generated & uploaded
--   3. The PDF has been stored in the bucket → path & SHA-256 known
--
-- This function performs ALL of the following inside a single
-- database transaction — either everything commits or nothing does:
--
--   Step 1 — Validate the KYC request
--            Checks: exists, belongs to tenant, not already completed,
--            token not expired, status is pending/in_progress.
--            The row is locked with FOR UPDATE to prevent a race where
--            two concurrent requests both try to complete the same KYC.
--
--   Step 2 — Validate the PDF SHA-256 format
--            Must be exactly 64 lowercase hex characters.
--
--   Step 3 — Deduct ₹5 (5 credits) from the host wallet
--            Inserts a -5 row into wallet_transactions.
--            The trg_update_wallet_balance trigger fires and updates
--            wallets.balance via a SUM recalculation.
--            The CHECK (balance >= 0) constraint on wallets will raise
--            SQLSTATE 23514 if the balance would go negative — this
--            rolls back the entire transaction automatically.
--
--   Step 4 — Record the consent signature
--            Inserts into guest_consent_signatures with all legal fields.
--
--   Step 5 — Mark the request as completed
--            Sets status = 'completed', credits_charged = true.
--
--   Step 6 — Return a JSONB result
--            On success: { success, transaction_id, signature_id, credits_charged }
--            On failure: { success: false, error, code }
--
-- Error codes returned:
--   NOT_FOUND         — request not found or wrong tenant
--   ALREADY_COMPLETED — credits_charged is already true
--   TOKEN_EXPIRED     — token_expires_at has passed
--   INVALID_STATE     — status is not pending/in_progress
--   INVALID_HASH      — pdf_sha256 format is wrong
--   23514             — insufficient wallet balance (CHECK violation)
--   (SQLSTATE)        — any other unexpected DB error
-- ================================================================

CREATE OR REPLACE FUNCTION public.complete_guest_kyc_v1(
  -- ── Required parameters (no defaults) ────────────────────────
  -- PostgreSQL rule: all DEFAULT params must come after all required ones.

  -- KYC request identification
  p_request_id           UUID,
  p_tenant_id            UUID,

  -- PDF artifact (generated server-side before calling this function)
  p_pdf_path             TEXT,
  p_pdf_sha256           TEXT,       -- SHA-256 hex digest, exactly 64 chars

  -- Verbatim consent body that was shown to and signed by the guest
  p_consent_text         TEXT,

  -- Guest identity (self-reported)
  p_guest_name           TEXT,

  -- Legal compliance fields — captured from HTTP request headers
  -- These MUST be passed from the server; never trust client-supplied values.
  p_signer_ip            TEXT,
  p_signer_user_agent    TEXT,

  -- ── Optional parameters (all with defaults) ───────────────────
  p_pdf_size_bytes       BIGINT      DEFAULT NULL,
  p_consent_form_id      UUID        DEFAULT NULL,
  p_consent_form_version TEXT        DEFAULT NULL,
  p_guest_email          TEXT        DEFAULT NULL,
  p_guest_phone          TEXT        DEFAULT NULL,
  p_signed_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Optional drawn/typed signature as base64 PNG data URI
  p_signature_base64     TEXT        DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_request          RECORD;
  v_txn_id           UUID;
  v_signature_id     UUID;
  -- Cost in credits (₹1 = 1 credit, so ₹5 = 5 credits)
  v_kyc_credit_cost  CONSTANT NUMERIC := 5;
BEGIN

  -- ── Step 1: Validate the KYC request ──────────────────────────
  SELECT
    id,
    tenant_id,
    status,
    token_expires_at,
    credits_charged,
    consent_form_id
  INTO v_request
  FROM public.guest_kyc_requests
  WHERE id        = p_request_id
    AND tenant_id = p_tenant_id
  FOR UPDATE;  -- Serialise concurrent completion attempts on this row

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'KYC request not found or does not belong to this tenant',
      'code',    'NOT_FOUND'
    );
  END IF;

  -- Guard against double-billing (idempotency check)
  IF v_request.credits_charged OR v_request.status = 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'KYC request has already been completed',
      'code',    'ALREADY_COMPLETED'
    );
  END IF;

  -- Token expiry check — expire the row as a side-effect for consistency
  IF v_request.token_expires_at < NOW() THEN
    UPDATE public.guest_kyc_requests
    SET    status     = 'expired',
           updated_at = NOW()
    WHERE  id = p_request_id;

    RETURN jsonb_build_object(
      'success', false,
      'error',   'This KYC link has expired',
      'code',    'TOKEN_EXPIRED'
    );
  END IF;

  -- Only allow completion from valid intermediate states
  IF v_request.status NOT IN ('pending', 'in_progress') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'KYC request is in an unexpected state: ' || v_request.status,
      'code',    'INVALID_STATE'
    );
  END IF;

  -- ── Step 2: Validate PDF hash format ──────────────────────────
  IF p_pdf_sha256 IS NULL OR p_pdf_sha256 !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'p_pdf_sha256 must be a 64-character lowercase hex string',
      'code',    'INVALID_HASH'
    );
  END IF;

  -- ── Step 3: Deduct 5 credits (₹5) from the host wallet ────────
  --
  -- The trg_update_wallet_balance trigger on wallet_transactions will
  -- recalculate wallets.balance after this INSERT. If the new balance
  -- would fall below 0, the CHECK (balance >= 0) constraint on public.wallets
  -- raises check_violation (SQLSTATE 23514), rolling back this entire
  -- transaction — no money is taken, no signature is recorded.
  INSERT INTO public.wallet_transactions (
    tenant_id,
    amount,
    type,
    description,
    metadata
  )
  VALUES (
    p_tenant_id,
    -v_kyc_credit_cost,              -- negative = deduction
    'kyc_completion',
    'Nodebase KYC — Guest identity verification',
    jsonb_build_object(
      'kyc_request_id', p_request_id,
      'guest_name',     p_guest_name,
      'pdf_sha256',     p_pdf_sha256
    )
  )
  RETURNING id INTO v_txn_id;

  -- ── Step 4: Record the consent signature ──────────────────────
  INSERT INTO public.guest_consent_signatures (
    kyc_request_id,
    consent_form_id,
    tenant_id,
    guest_name,
    guest_email,
    guest_phone,
    signer_ip,
    signer_user_agent,
    signed_at,
    signature_base64,
    pdf_storage_path,
    pdf_sha256,
    pdf_size_bytes,
    consent_text_snapshot,
    consent_form_version
  )
  VALUES (
    p_request_id,
    COALESCE(p_consent_form_id, v_request.consent_form_id),
    p_tenant_id,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_signer_ip,
    p_signer_user_agent,
    p_signed_at,
    p_signature_base64,
    p_pdf_path,
    p_pdf_sha256,
    p_pdf_size_bytes,
    p_consent_text,
    p_consent_form_version
  )
  RETURNING id INTO v_signature_id;

  -- ── Step 5: Mark the request as completed ─────────────────────
  UPDATE public.guest_kyc_requests
  SET
    status          = 'completed',
    credits_charged = true,
    updated_at      = NOW()
  WHERE id = p_request_id;

  -- ── Step 6: Return success payload ────────────────────────────
  RETURN jsonb_build_object(
    'success',         true,
    'transaction_id',  v_txn_id,
    'signature_id',    v_signature_id,
    'credits_charged', v_kyc_credit_cost
  );

EXCEPTION
  -- Insufficient wallet balance: CHECK (balance >= 0) fired
  WHEN check_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Insufficient wallet balance. Please top up at least ₹5 to complete this KYC.',
      'code',    SQLSTATE   -- '23514'
    );

  -- Any other unexpected database error
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM,
      'code',    SQLSTATE
    );
END;
$$;

COMMENT ON FUNCTION public.complete_guest_kyc_v1 IS
  'Atomically completes a guest KYC request. '
  'Deducts 5 credits (₹5) from the host wallet, records the legally '
  'required consent signature (IP, user-agent, timestamp, PDF hash), '
  'and marks the request as completed. '
  'The entire operation rolls back if the wallet balance is insufficient '
  'or any other error occurs. Safe to retry on network failure '
  'because of the credits_charged idempotency guard.';


-- ================================================================
-- SECTION 8: get_kyc_request_by_token() — Public guest portal loader
-- ================================================================
-- The guest-facing /kyc/[token] page is completely unauthenticated.
-- Rather than granting a broad public SELECT policy on the
-- guest_kyc_requests table, this SECURITY DEFINER function acts as
-- a controlled read gateway:
--   • It validates the token and expiry before returning anything.
--   • It joins to tenants and consent_forms so the portal has all the
--     data it needs in a single call.
--   • The underlying tables remain fully RLS-restricted.
--
-- STABLE (not IMMUTABLE): reads current DB state on each call so
-- that expiry and status changes are always reflected accurately.
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_kyc_request_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_req  RECORD;
  v_form RECORD;
BEGIN
  -- Load the request and the tenant name in one query
  SELECT
    r.id,
    r.tenant_id,
    r.status,
    r.token_expires_at,
    r.credits_charged,
    r.guest_name,
    r.guest_email,
    r.guest_phone,
    r.booking_reference,
    r.consent_form_id,
    t.name AS tenant_name
  INTO v_req
  FROM  public.guest_kyc_requests r
  JOIN  public.tenants t ON t.id = r.tenant_id
  WHERE r.token = p_token;

  -- Unknown token
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'This verification link is invalid or has already been used.',
      'code',    'NOT_FOUND'
    );
  END IF;

  -- Token has expired (check before status so the error message is specific)
  IF v_req.token_expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'This verification link has expired. Please ask your host to send a new one.',
      'code',    'TOKEN_EXPIRED'
    );
  END IF;

  -- Already completed
  IF v_req.status = 'completed' OR v_req.credits_charged THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Your identity verification is already complete. No further action is needed.',
      'code',    'ALREADY_COMPLETED'
    );
  END IF;

  -- Host has manually rejected the request
  IF v_req.status = 'rejected' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'This verification request has been cancelled by the host.',
      'code',    'REJECTED'
    );
  END IF;

  -- Load the linked consent form if one is attached
  IF v_req.consent_form_id IS NOT NULL THEN
    SELECT title, body_markdown, version
    INTO   v_form
    FROM   public.consent_forms
    WHERE  id        = v_req.consent_form_id
      AND  is_active = true;
  END IF;

  RETURN jsonb_build_object(
    'success',           true,
    'request_id',        v_req.id,
    'tenant_id',         v_req.tenant_id,
    'tenant_name',       v_req.tenant_name,
    'status',            v_req.status,
    'guest_name',        v_req.guest_name,
    'guest_email',       v_req.guest_email,
    'guest_phone',       v_req.guest_phone,
    'booking_reference', v_req.booking_reference,
    'consent_form',      CASE
                           WHEN v_form IS NOT NULL THEN
                             jsonb_build_object(
                               'id',      v_req.consent_form_id,
                               'title',   v_form.title,
                               'body',    v_form.body_markdown,
                               'version', v_form.version
                             )
                           ELSE NULL
                         END
  );
END;
$$;

COMMENT ON FUNCTION public.get_kyc_request_by_token(TEXT) IS
  'Safe read gateway for the unauthenticated guest KYC portal. '
  'Validates the token, checks expiry and status, and returns all '
  'data needed to render the portal in a single call. '
  'Runs as SECURITY DEFINER so the underlying tables can remain '
  'fully RLS-restricted without a broad public SELECT policy.';


-- ================================================================
-- SECTION 9: ROW LEVEL SECURITY
-- ================================================================
-- All four new tables use the same tenant-isolation pattern as the
-- rest of the schema: a user can only see rows belonging to tenants
-- they are a member of (via tenant_users).
--
-- Guest portal operations (token-based, no auth) go exclusively
-- through the SECURITY DEFINER RPCs above, so no public INSERT
-- or SELECT policy is needed on any of these tables.
-- ================================================================

-- ── consent_forms ────────────────────────────────────────────────
ALTER TABLE public.consent_forms ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.consent_forms FORCE   ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_consent_forms ON public.consent_forms;
CREATE POLICY tenant_isolation_consent_forms
  ON public.consent_forms
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- ── guest_kyc_requests ───────────────────────────────────────────
ALTER TABLE public.guest_kyc_requests ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.guest_kyc_requests FORCE   ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_guest_kyc_requests ON public.guest_kyc_requests;
CREATE POLICY tenant_isolation_guest_kyc_requests
  ON public.guest_kyc_requests
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- ── guest_documents ──────────────────────────────────────────────
ALTER TABLE public.guest_documents ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.guest_documents FORCE   ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_guest_documents ON public.guest_documents;
CREATE POLICY tenant_isolation_guest_documents
  ON public.guest_documents
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- ── guest_consent_signatures ─────────────────────────────────────
-- Tenants may SELECT their own signatures for audit/download.
-- INSERT is only ever done by complete_guest_kyc_v1() (SECURITY DEFINER),
-- so no WITH CHECK policy is needed.
-- UPDATE and DELETE are intentionally blocked for immutability.
ALTER TABLE public.guest_consent_signatures ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.guest_consent_signatures FORCE   ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_read_guest_consent_signatures ON public.guest_consent_signatures;
CREATE POLICY tenant_read_guest_consent_signatures
  ON public.guest_consent_signatures
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()
    )
  );

-- Admins can view all signatures for support and compliance purposes
DROP POLICY IF EXISTS admin_all_guest_consent_signatures ON public.guest_consent_signatures;
CREATE POLICY admin_all_guest_consent_signatures
  ON public.guest_consent_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );


-- ================================================================
-- SECTION 10: INDEXES
-- ================================================================

-- ── consent_forms ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_consent_forms_tenant
  ON public.consent_forms (tenant_id);

-- Fast lookup for "give me the active form for this tenant"
CREATE INDEX IF NOT EXISTS idx_consent_forms_tenant_active
  ON public.consent_forms (tenant_id)
  WHERE is_active = true;

-- ── guest_kyc_requests ───────────────────────────────────────────
-- Token lookup is the single hottest query path (every guest page load)
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_kyc_requests_token
  ON public.guest_kyc_requests (token);

CREATE INDEX IF NOT EXISTS idx_guest_kyc_requests_tenant
  ON public.guest_kyc_requests (tenant_id);

-- Dashboard filter: "show me all pending KYCs for my tenant"
CREATE INDEX IF NOT EXISTS idx_guest_kyc_requests_tenant_status
  ON public.guest_kyc_requests (tenant_id, status);

-- Expiry sweeper job: quickly find rows to mark as expired
CREATE INDEX IF NOT EXISTS idx_guest_kyc_requests_expires
  ON public.guest_kyc_requests (token_expires_at)
  WHERE status IN ('pending', 'in_progress');

-- ── guest_documents ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guest_documents_kyc_request
  ON public.guest_documents (kyc_request_id);

CREATE INDEX IF NOT EXISTS idx_guest_documents_tenant
  ON public.guest_documents (tenant_id);

-- ── guest_consent_signatures ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guest_consent_sigs_kyc_request
  ON public.guest_consent_signatures (kyc_request_id);

CREATE INDEX IF NOT EXISTS idx_guest_consent_sigs_tenant
  ON public.guest_consent_signatures (tenant_id);

-- Non-repudiation lookup: verify a known SHA-256 against the database
CREATE INDEX IF NOT EXISTS idx_guest_consent_sigs_sha256
  ON public.guest_consent_signatures (pdf_sha256);


-- ================================================================
-- SECTION 11: STORAGE BUCKET NOTES
-- ================================================================
-- The following storage buckets must be created in Supabase Storage
-- before the KYC engine is used. SQL cannot create storage buckets;
-- use the Supabase dashboard or the Management API.
--
--  1. kyc-documents  (PRIVATE)
--     Purpose : Guest ID photo uploads (front/back images)
--     Path    : kyc-documents/{tenant_id}/{kyc_request_id}/{uuid}.{ext}
--     Access  : Service role only. Hosts view via signed URLs generated
--               server-side. Guests upload via a server-proxied endpoint
--               that validates the token before accepting the file.
--     RLS     : Bucket is private; all access goes through the API layer.
--
--  2. kyc-consents  (PRIVATE)
--     Purpose : Signed PDF consent documents
--     Path    : kyc-consents/{tenant_id}/{kyc_request_id}/consent-{uuid}.pdf
--     Access  : Service role only. Tenant owners can download via a
--               signed URL endpoint that verifies tenant membership.
--               These files must NEVER be publicly accessible.
--     RLS     : Bucket is private; signed URLs expire after 1 hour max.
-- ================================================================


-- ================================================================
-- END OF MIGRATION 019
-- ================================================================
