# Integrations & New Feature Scaffolding

This file documents the integration scaffolding added to the repository: public pages, diagnostic endpoints, service skeletons for Telephony (Nodebase Voice) and Vision (Nodebase Eyes), and the DB migration that seeds the feature flags.

Paths (created/modified)
- Public pages
  - `src/app/(public)/integrations/page.tsx` — Integrations landing (single-sourced article render).
  - `src/app/(public)/docs/nodebase-voice/page.tsx` — Public doc for Nodebase Voice.
  - `src/app/(public)/docs/nodebase-eyes/page.tsx` — Public doc for Nodebase Eyes.
- WAHA (WhatsApp) diagnostic endpoint
  - `src/app/api/integrations/whatsapp/debug/route.ts` — Proxy to WAHA server `POST /start-session` for QR generation debugging.
- Telephony (Nodebase Voice)
  - `src/lib/services/telephonyService.ts` — Provider adapter registry and in-memory session store.
  - `src/lib/services/telephony/providers/twilio.ts` — Twilio adapter skeleton (example implementation).
- Eyes (Nodebase Eyes)
  - `src/lib/services/eyesService.ts` — Camera descriptor registry and ingestFrame placeholder.
- Admin UI (launch controls)
  - `src/components/admin/launch/LaunchControls.tsx` — Simple UI that toggles feature flags (calls admin API endpoint).
- Migration
  - `migrations/20260401_add_voice_eyes_flags.sql` — Adds `system_flags` table (if missing) and inserts `voice_global_enabled`/`eyes_global_enabled` defaulted to `false`.

Environment variables referenced
- WAHA
  - `WAHA_SERVER_URL` (required by the WAHA debug endpoint)
  - `WAHA_API_KEY` (optional; used as Authorization Bearer to WAHA)
- Telephony / Twilio (optional unless you wire Twilio adapter)
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- General
  - `NEXT_PUBLIC_APP_URL` (optional; useful when constructing callback/webhook URLs)

What each artifact does (short)
- WAHA debug endpoint
  - POSTs to `${WAHA_SERVER_URL}/start-session` with `debug: true`.
  - Returns the raw WAHA response (expected to include QR URL or session status).
  - Use this to verify reachability and QR generation without inspecting remote logs.
- `telephonyService`
  - Provides `registerProviderAdapter()`, `getProvider()`, `startCall()`, `hangup()`, and an in-memory `sessions` store.
  - Adapters implement the `TelephonyProvider` shape.
  - Currently in-memory: production should persist sessions to the DB.
- Twilio adapter skeleton
  - Demonstrates how to implement `startCall`, `hangup`, and `getSession`.
  - Does not call Twilio SDK by default — you should wire the SDK and credentials before using in production.
- `eyesService`
  - Simple registry for cameras and a stub `ingestFrame()` that should be replaced with workers that persist frames + run inference.
- Admin LaunchControls
  - Example UI that posts to `/api/admin/flags/toggle?key=...`. The server-side admin toggle endpoint must exist and be secured; if your codebase has an admin flags API, point the UI to it.

Recommended next steps / checklist
1. Review & commit the migration:
   - Run `migrations/20260401_add_voice_eyes_flags.sql` against your Postgres database.
   - Confirm `system_flags` table exists and both flags are present and set to `false`.
2. WAHA validation:
   - Ensure `WAHA_SERVER_URL` (and optional `WAHA_API_KEY`) are set in the environment.
   - As an authenticated tenant, call `GET /api/integrations/whatsapp/debug` and verify the returned JSON includes either a `qrUrl` or diagnostic status from the WAHA server.
   - If WAHA returns a QR, scan it and assert that your existing integration status callback (e.g., `/api/integrations/whatsapp/status`) updates the integration record as expected.
3. Telephony (Nodebase Voice) — enable carefully:
   - Provide Twilio (or other provider) credentials as environment variables.
   - Implement the adapter to use the provider SDK (the Twilio skeleton contains comments showing where to integrate the SDK).
   - Register the adapter during server bootstrap:
     ```ts
     import { registerProviderAdapter } from 'src/lib/services/telephonyService';
     import { createTwilioAdapter } from 'src/lib/services/telephony/providers/twilio';

     const tw = createTwilioAdapter({});
     registerProviderAdapter(tw);
     ```
   - Consider persisting telephony sessions to the DB instead of the provided in-memory store.
   - Integrate STT/TTS, consent workflows, call recordings, and operator handoff flows before enabling in production.
   - Flip `voice_global_enabled` via admin UI only after validating on staging.
4. Eyes (Nodebase Eyes) — plan and implement:
   - Design secure credential storage for camera endpoints (do NOT store plain secrets in DB).
   - Implement ingest workers that persist video frames / metadata and run model inference offline or in a streaming pipeline.
   - Route model-detected events to your Flow/Event system for alerts or operational handling.
   - Flip `eyes_global_enabled` via admin UI only after proper infra and access controls are in place.
5. Admin toggle endpoint:
   - The example `LaunchControls.tsx` calls `/api/admin/flags/toggle`. If your system already exposes admin flag APIs, wire the UI to them. If not, implement a secure admin POST endpoint that:
     - Requires admin authentication.
     - Accepts a flag `key` and toggles its boolean value in `system_flags`.
     - Returns the updated value.
6. Security & compliance:
   - Secrets: use your secret manager (Vault, cloud secret store) for provider credentials.
   - Telephony: ensure call recordings and PII are stored with appropriate encryption and access controls.
   - Vision: handle video/photo ingestion with strong access control and retention policies; redact/mask faces if required by jurisdiction/policy.
7. Testing:
   - Add integration tests for the WAHA debug endpoint to validate error handling when `WAHA_SERVER_URL` is missing and to confirm happy-path proxying.
   - Add unit tests for `telephonyService` adapter registration and session lifecycle helpers.
   - Add integration tests around admin toggles to prevent accidental flag flips by non-admins.

Notes / design decisions
- Feature flags default to OFF. This is intentional so new functionality remains gated until infra and policies are ready.
- The telephony session store is intentionally in-memory (to avoid schema debates). For production, migrate to a DB-backed sessions table with audit metadata and foreign keys to tenants/operators.
- The Twilio adapter is a skeleton to demonstrate the registration pattern — it intentionally does not crash server startup if credentials are missing.
- The WAHA debug endpoint assumes the external WAHA VPS exposes a compatible `POST /start-session` route. Adjust the endpoint path and payload to match your WAHA server implementation.

Files you may want to add next (suggestions)
- DB migration for `telephony_sessions` and `camera_sessions` tables (persist call metadata, start/end timestamps, recordings refs, operator ids).
- Server bootstrap snippet that registers adapters conditionally based on `TELEPHONY_PROVIDER` env var.
- Admin audit logs for flag changes (who toggled, when, from which IP).
- Worker scaffolding for camera frame ingest and model inference.

Contact / ownership
- If you want, I can:
  - Add DB migrations for sessions (telephony + camera) and example schema.
  - Wire the Twilio adapter with the official SDK and add basic integration tests.
  - Implement the secure admin toggle endpoint (server-side) and wire the `LaunchControls` UI to it.
  - Run diagnostics against a reachable WAHA_SERVER_URL if you provide access in staging.

Make a call and I will implement the follow-up you prefer (create migrations, wire adapters, or implement admin endpoints).