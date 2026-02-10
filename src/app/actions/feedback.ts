"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function submitFeedbackAction(message: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();
  
  // Log to a simple 'feedback' table if exists, or just log to console/audit for MVP
  // Ideally we'd have a feedback table. For now, let's insert into 'audit_logs' or similar if generic,
  // OR just assume we have a feedback table. 
  // Let's create a quick 'feedback' table migration if we have time, 
  // but for now, I'll log it as a system event so admins can see it in logs.
  
  const { error } = await supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    event_type: 'USER_FEEDBACK',
    details: { message, source: 'early_access_modal' },
    status: 'info'
  });

  if (error) {
    console.error("Failed to log feedback:", error);
    // Don't throw, just log
  }
}
