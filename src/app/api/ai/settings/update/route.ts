import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getTenantIdForUser } from "@/app/actions/auth";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const settings = body?.settings;

    if (!settings) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Log AI Settings Changed
    const tenantId = await getTenantIdForUser(user.id);
    if (tenantId) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: user.id,
        event_type: EVENT_TYPES.AI_SETTINGS_CHANGED,
        entity_type: 'ai_settings',
        entity_id: tenantId, // Settings are usually per tenant
        metadata: { 
          changes: Object.keys(settings) // Just log keys changed for privacy/size
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
  }
}
