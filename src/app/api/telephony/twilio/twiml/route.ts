import { NextResponse } from "next/server";

/**
 * Minimal TwiML route for Twilio to request call instructions (TwiML).
 * Example usage (Twilio will call this URL when a call is answered):
 *   GET /api/telephony/twilio/twiml
 *
 * Optional query params:
 * - message: text to speak (default: "Hello. This is an AI-enabled call from Nodebase. Connecting you now.")
 * - voice: voice identifier (default: "Polly.Joanna")
 *
 * Notes:
 * - Keep TwiML responses small and deterministic. For advanced flows serve dynamic
 *   TwiML based on call metadata / stored session state.
 * - This endpoint returns `text/xml` content required by Twilio.
 */

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string) {
  return escapeXml(s);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const message =
      url.searchParams.get("message") ||
      "Hello. This is an AI-enabled call from Nodebase. Connecting you now.";
    const voice = url.searchParams.get("voice") || "Polly.Joanna";

    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response>` +
      `<Say voice="${escapeAttr(voice)}">${escapeXml(message)}</Say>` +
      `</Response>`;

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (err: any) {
    // On error, return a safe TwiML that politely ends the call.
    const safe = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">An error occurred. Goodbye.</Say><Hangup/></Response>`;
    return new NextResponse(safe, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      status: 200,
    });
  }
}
