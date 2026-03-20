import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Twilio webhook handler
 *
 * - Verifies X-Twilio-Signature when TWILIO_AUTH_TOKEN is configured.
 * - Accepts application/x-www-form-urlencoded POSTs from Twilio (status callbacks).
 * - Updates (or upserts) the matching telephony_sessions row using provider_reference = CallSid.
 *
 * Notes:
 * - Twilio builds the signature by concatenating the full request URL and the
 *   POST parameter values (sorted by parameter name) and computing HMAC-SHA1
 *   with your auth token, then Base64-encoding the result. We implement that
 *   algorithm here for verification when an auth token is present.
 * - Ensure your Twilio console Status Callback URL exactly matches the public
 *   URL used by Twilio (including protocol and path). Mismatched URLs will break signature verification.
 */

function parseFormEncoded(bodyText: string): Record<string, string> {
  const params = new URLSearchParams(bodyText);
  const obj: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    obj[k] = v;
  }
  return obj;
}

/**
 * Verify X-Twilio-Signature according to Twilio's algorithm.
 * Returns true if signature matches, false otherwise.
 */
function verifyTwilioSignature(
  authToken: string,
  requestUrl: string,
  params: Record<string, string>,
  signatureHeader?: string | null,
): boolean {
  if (!signatureHeader) return false;

  // Build the data string: url + concatenated values (keys sorted lexicographically)
  const keys = Object.keys(params).sort();
  let data = requestUrl;
  for (const k of keys) {
    data += params[k];
  }

  const hmac = crypto
    .createHmac("sha1", authToken)
    .update(data, "utf8")
    .digest("base64");
  // Timing-safe compare
  const a = Buffer.from(hmac);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    // Twilio sends form-urlencoded bodies for status callbacks
    const params = parseFormEncoded(text);

    const CallSid = params["CallSid"] ?? null;
    const CallStatus = params["CallStatus"] ?? params["CallStatus"] ?? null; // double-check key
    const From = params["From"] ?? null;
    const To = params["To"] ?? null;
    const Duration = params["CallDuration"] ?? params["Duration"] ?? null;

    if (!CallSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    // Optional signature verification if auth token is provided
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || null;
    if (twilioAuthToken) {
      const signatureHeader =
        request.headers.get("x-twilio-signature") ||
        request.headers.get("X-Twilio-Signature");
      // Use the absolute URL Twilio used when calling the webhook.
      // request.url should be the full URL served by Next (including path).
      const requestUrl = request.url;
      const ok = verifyTwilioSignature(
        twilioAuthToken,
        requestUrl,
        params,
        signatureHeader,
      );
      if (!ok) {
        return NextResponse.json(
          { error: "Invalid Twilio signature" },
          { status: 401 },
        );
      }
    }

    // Persist/update session state in Supabase
    const supabase = await getSupabaseAdmin();

    // Try to update existing row by provider_reference / CallSid
    const updatePayload: Record<string, any> = {
      status: CallStatus ?? undefined,
      updated_at: new Date().toISOString(),
    };

    if (Duration) updatePayload.ended_at = new Date().toISOString();

    // If row exists, update it; if not, insert a new minimal row
    // We'll use upsert so that a missing row is created.
    const upsertPayload = {
      provider_reference: CallSid,
      provider: "twilio",
      status: CallStatus ?? "unknown",
      metadata: {
        received_at: new Date().toISOString(),
        raw: params,
        from: From,
        to: To,
        duration: Duration,
      },
      started_at: null,
      ended_at: Duration ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt upsert: if the row exists, merge updates; otherwise insert new.
    // Use `telephony_sessions` table created by migrations.
    await supabase
      .from("telephony_sessions")
      .upsert([upsertPayload], { onConflict: "provider_reference" });

    // If you prefer to maintain a more detailed event log, consider inserting into a telephony_events table here.

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Do not leak internal errors; return a generic message and log the error server-side.
    const message = err?.message ?? String(err);
    // eslint-disable-next-line no-console
    console.error("[Twilio Webhook] error:", message, err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
