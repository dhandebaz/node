import type {
  TelephonyProviderAdapter,
  TelephonySession,
  StartCallOptions,
} from "@/lib/services/telephonyService";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
/* Twilio is required dynamically inside the adapter to avoid build-time
   module/type errors in environments where `twilio` may not be installed.
   The adapter will require the module at runtime when TELEPHONY_PROVIDER=twilio. */

/**
 * Twilio adapter factory.
 *
 * Usage:
 *   import { createTwilioAdapter } from '@/lib/services/telephony/providers/twilio';
 *   const adapter = createTwilioAdapter();
 *   registerProviderAdapter(adapter);
 *
 * This adapter requires the following env vars to be set:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - NEXT_PUBLIC_APP_URL (used to construct webhook/TwiML URLs)
 * - TWILIO_PHONE_NUMBER (recommended default 'from' number)
 *
 * The adapter will throw on creation if credentials are missing to avoid silent mocks.
 */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function upsertSession(session: TelephonySession) {
  const supabase = await getSupabaseAdmin();
  const payload = {
    id: session.id,
    tenant_id: (session.metadata && (session.metadata as any).tenantId) ?? null,
    provider: session.provider,
    provider_reference: (session as any).provider_reference ?? null,
    status: session.status,
    metadata: session.metadata ?? null,
    started_at: session.created_at ?? null,
    updated_at: session.updated_at ?? null,
    ended_at: (session as any).ended_at ?? null,
  };

  // Use array + onConflict for upsert to match Supabase client v2 typings.
  // Avoid `returning` option which is not accepted in this codebase's supabase client types.
  await supabase
    .from("telephony_sessions")
    .upsert([payload], { onConflict: "provider_reference" });
}

export function createTwilioAdapter(): TelephonyProviderAdapter {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl)
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL (required for webhook/TwiML URLs)",
    );
  const defaultFrom = process.env.TWILIO_PHONE_NUMBER;

  // Dynamically require Twilio at runtime so builds won't fail when the package
  // or types are not present in certain environments.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const TwilioLib = require("twilio");
  const client = TwilioLib(accountSid, authToken);

  return {
    providerName: "twilio",

    async startCall(opts: StartCallOptions): Promise<TelephonySession> {
      const from = opts.from || defaultFrom;
      if (!from)
        throw new Error(
          "Twilio 'from' number required (opts.from or TWILIO_PHONE_NUMBER)",
        );

      const twimlUrl = `${baseUrl.replace(/\/$/, "")}/api/telephony/twilio/twiml`;
      const statusCallback = `${baseUrl.replace(/\/$/, "")}/api/telephony/webhooks/twilio`;

      const call = await client.calls.create({
        to: opts.to,
        from,
        url: twimlUrl,
        statusCallback,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      });

      const now = new Date().toISOString();
      const session: TelephonySession = {
        id: call.sid,
        provider: "twilio",
        provider_reference: call.sid,
        status: "initiated",
        metadata: {
          raw: call,
          tenantId: opts.tenantId ?? null,
          webhookUrl: opts.webhookUrl ?? null,
          custom: opts.metadata ?? null,
        },
        created_at: now,
        updated_at: now,
      };

      await upsertSession(session);
      return session;
    },

    async hangup(providerReferenceOrSessionId: string): Promise<void> {
      // Try to end the call via Twilio API
      await client
        .calls(providerReferenceOrSessionId)
        .update({ status: "completed" });

      const supabase = await getSupabaseAdmin();
      await supabase
        .from("telephony_sessions")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("provider_reference", providerReferenceOrSessionId);
    },

    async getSession(
      providerReferenceOrSessionId: string,
    ): Promise<TelephonySession | null> {
      const call = await client.calls(providerReferenceOrSessionId).fetch();
      if (!call) return null;

      const session: TelephonySession = {
        id: call.sid,
        provider: "twilio",
        provider_reference: call.sid,
        status: (call.status as string) ?? "unknown",
        metadata: { raw: call },
        created_at: call.startTime
          ? new Date(call.startTime).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await upsertSession(session);
      return session;
    },
  };
}

export default createTwilioAdapter;
