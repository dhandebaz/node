import { getSupabaseAdmin } from "@/lib/supabase/server";
import { CreateAuditEventParams } from "@/types/events";
export { EVENT_TYPES } from "@/types/events";

/**
 * Logs an audit event to the database.
 * This function is "fire and forget" - it will not throw errors that block the main execution flow,
 * but will log failures to the console.
 */
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'auth', 'authorization',
  'credit_card', 'card_number', 'cvv', 'cvc', 'pan',
  'aadhaar', 'passport', 'license', 'voter_id', // Government IDs
  'raw_message', 'full_text' // Prevent raw message storage
];

function redactMetadata(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(redactMetadata);
  }

  const redacted: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactMetadata(obj[key]);
      }
    }
  }
  return redacted;
}

export async function logEvent(params: CreateAuditEventParams) {
  try {
    const supabase = await getSupabaseAdmin();
    
    // Ensure metadata is an object and redact sensitive info
    const metadata = redactMetadata(params.metadata || {});

    const { error } = await supabase.from('audit_events').insert({
      tenant_id: params.tenant_id,
      actor_type: params.actor_type,
      actor_id: params.actor_id,
      event_type: params.event_type,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      metadata: metadata,
    });

    if (error) {
      console.error("CRITICAL: Failed to log audit event:", error, params);
      // In a real production system, this might send an alert to Sentry/PagerDuty
    }
  } catch (err) {
    console.error("CRITICAL: Exception during audit logging:", err, params);
  }
}
