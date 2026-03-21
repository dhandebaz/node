/**
 * node/src/lib/services/telephonyService.ts
 *
 * TelephonyService
 *
 * Lightweight abstraction layer and skeleton implementation for telephony providers.
 * - Provides a stable interface that the rest of the app can call.
 * - Routes requests to provider-specific adapters (Twilio, SignalWire, Plivo, SIP, etc).
 * - Includes helpful error messages and clear TODOs where provider implementations belong.
 *
 * Usage:
 *   import { telephonyService } from "@/lib/services/telephonyService";
 *   await telephonyService.startCall({ tenantId, to: "+911234567890", from: "+91...", webhookUrl: "https://..." });
 *
 * Important: This file only provides a runtime router + development-safe fallbacks.
 * Implement real provider adapters under:
 *   src/lib/services/telephony/providers/twilio.ts
 *   src/lib/services/telephony/providers/signalwire.ts
 *   src/lib/services/telephony/providers/plivo.ts
 *   src/lib/services/telephony/providers/sip.ts
 *
 * Each adapter should export an object that implements TelephonyProviderAdapter.
 *
 * Security: Provider credentials should be stored in environment variables or a secure secret store.
 * Example env names:
 *   TELEPHONY_PROVIDER=twilio
 *   TWILIO_ACCOUNT_SID=...
 *   TWILIO_AUTH_TOKEN=...
 *   SIGNALWIRE_PROJECT=...
 *
 * NOTE: This file intentionally throws clear errors when no provider is configured to avoid silent mocks.
 */

export type TelephonyProvider =
  | "twilio"
  | "signalwire"
  | "plivo"
  | "sip"
  | "none";

export type TelephonySession = {
  id: string;
  provider: TelephonyProvider;
  status: string; // e.g. 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed'
  provider_reference?: string; // provider call/session id
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
};

export type StartCallOptions = {
  tenantId?: string;
  to: string; // e.g. international E.164 phone number
  from?: string; // optional from number
  webhookUrl?: string; // provider callback url for call events
  // provider-specific overrides can be provided in metadata
  metadata?: Record<string, any>;
};

export type TelephonyError = {
  code?: string | number;
  message: string;
  raw?: unknown;
};

export interface TelephonyProviderAdapter {
  providerName: TelephonyProvider;
  // Start an outbound call, or create a session to accept an inbound call handoff
  startCall(opts: StartCallOptions): Promise<TelephonySession>;
  // Hangup an active call (provider_reference or session id)
  hangup(providerReferenceOrSessionId: string): Promise<void>;
  // Get session/call status by provider reference or internal session id
  getSession(
    providerReferenceOrSessionId: string,
  ): Promise<TelephonySession | null>;
}

/**
 * Simple in-memory store for lightweight sessions.
 * In production you'd persist sessions to your DB (integrations, audits, billing).
 * This store is intentionally minimal.
 */
const inMemorySessions: Map<string, TelephonySession> = new Map();

/**
 * Provider registry (adapters). Real implementations should be attached here.
 * Example:
 *   import { twilioAdapter } from "./providers/twilio"
 *   registerProviderAdapter(twilioAdapter)
 */
const providerAdapters: Map<TelephonyProvider, TelephonyProviderAdapter> =
  new Map();

/**
 * Register a provider adapter at runtime. Adapters should be registered by an
 * initialization script (server bootstrap) or by individual provider modules.
 */
export function registerProviderAdapter(adapter: TelephonyProviderAdapter) {
  if (!adapter || !adapter.providerName) {
    throw new Error("Invalid telephony adapter");
  }
  providerAdapters.set(adapter.providerName, adapter);
}

/**
 * Helper: Resolve configured provider from env and available adapters.
 * Fallback: 'none' means no provider configured and service will throw on use.
 */
export function resolveConfiguredProvider(): TelephonyProvider {
  const env = (process.env.TELEPHONY_PROVIDER || "").toLowerCase();
  if (!env) return "none";
  if (env === "twilio") return "twilio";
  if (env === "signalwire") return "signalwire";
  if (env === "plivo") return "plivo";
  if (env === "sip") return "sip";
  return "none";
}

/**
 * Default "router" telephony service which delegates to the configured provider adapter.
 * If no provider adapter exists for the configured provider, the service will throw a descriptive error.
 *
 * NOTE: This is intentionally synchronous in adapter lookup; adapters should be registered
 * at server startup so the runtime has them available.
 */
export const telephonyService = {
  async startCall(opts: StartCallOptions): Promise<TelephonySession> {
    const provider = resolveConfiguredProvider();
    if (provider === "none") {
      throw new Error(
        "Telephony provider is not configured. Set TELEPHONY_PROVIDER and register an adapter.",
      );
    }

    const adapter = providerAdapters.get(provider);
    if (!adapter) {
      throw new Error(
        `No telephony adapter registered for provider '${provider}'. Implement and register one under src/lib/services/telephony/providers/ and call registerProviderAdapter(adapter).`,
      );
    }

    // Give adapters the chance to implement provider-specific behavior.
    const session = await adapter.startCall(opts);

    // Persist lightweight session in-memory for quick lookups.
    // Production: replace this with DB persistence (sessions table).
    if (session && session.id) {
      const now = new Date().toISOString();
      session.created_at = session.created_at ?? now;
      session.updated_at = now;
      inMemorySessions.set(session.id, session);
    }

    return session;
  },

  async hangup(providerReferenceOrSessionId: string): Promise<void> {
    const provider = resolveConfiguredProvider();
    if (provider === "none") {
      throw new Error("Telephony provider not configured (hangup).");
    }
    const adapter = providerAdapters.get(provider);
    if (!adapter) {
      throw new Error(
        `No telephony adapter registered for provider '${provider}' (hangup).`,
      );
    }

    // Call provider adapter
    await adapter.hangup(providerReferenceOrSessionId);

    // If we have an in-memory session, update its status
    for (const [sid, s] of inMemorySessions.entries()) {
      if (
        s.id === providerReferenceOrSessionId ||
        s.provider_reference === providerReferenceOrSessionId
      ) {
        s.status = "completed";
        s.updated_at = new Date().toISOString();
        inMemorySessions.set(sid, s);
        break;
      }
    }
  },

  async getSession(
    providerReferenceOrSessionId: string,
  ): Promise<TelephonySession | null> {
    const provider = resolveConfiguredProvider();
    // Try in-memory first
    for (const s of inMemorySessions.values()) {
      if (
        s.id === providerReferenceOrSessionId ||
        s.provider_reference === providerReferenceOrSessionId
      ) {
        return s;
      }
    }

    if (provider === "none") return null;
    const adapter = providerAdapters.get(provider);
    if (!adapter) {
      throw new Error(
        `No telephony adapter registered for provider '${provider}' (getSession).`,
      );
    }

    // Delegate to provider adapter to fetch latest status
    const session = await adapter.getSession(providerReferenceOrSessionId);
    if (session && session.id) {
      inMemorySessions.set(session.id, session);
    }
    return session;
  },

  /**
   * Helper to list current in-memory sessions (useful for quick diagnostics).
   * Not recommended for heavy use in production.
   */
  listLocalSessions(): TelephonySession[] {
    return Array.from(inMemorySessions.values());
  },
};

/**
 * ---- Example adapter skeleton
 *
 * A real provider implementation should live in its own module and be registered using:
 *
 *   import { registerProviderAdapter } from "@/lib/services/telephonyService";
 *   import { twilioAdapter } from "@/lib/services/telephony/providers/twilio";
 *   registerProviderAdapter(twilioAdapter);
 *
 * Example adapter shape:
 *
 * export const twilioAdapter: TelephonyProviderAdapter = {
 *   providerName: "twilio",
 *   async startCall(opts) {
 *     // use TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN env vars
 *     // call Twilio REST API to create call, return TelephonySession with provider_reference = Twilio Call SID
 *   },
 *   async hangup(providerReferenceOrSessionId) {
 *     // call Twilio API to update call status / hangup
 *   },
 *   async getSession(providerReferenceOrSessionId) {
 *     // fetch call resource from Twilio and map to TelephonySession
 *   }
 * }
 *
 * ---- Security & scaling notes
 * - Persist sessions in your DB (e.g. `telephony_sessions` table) and write events for auditing.
 * - Use a message queue / worker for media processing (recordings, STT) and do not block request paths on heavy processing.
 * - For inbound call handling, implement secure webhook endpoints that verify provider signatures.
 * - Implement tenant-level credentials storage and permissions (do not store raw secrets in plaintext in DB).
 */

/* Export types and utilities for external modules */
export default telephonyService;
