"use server";

import { getSession, deleteSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { log } from "@/lib/logger";

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9910778576";

// Helper to resolve tenant for logging
export async function getTenantIdForUser(userId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", userId)
      .limit(1)
      .single();
    return data?.tenant_id || null;
  } catch {
    return null;
  }
}

export async function adminLogoutAction(): Promise<void> {
  const session = await getSession();
  if (session?.userId) {
    const tenantId = await getTenantIdForUser(session.userId);
    log.info("Admin logged out", { userId: session.userId, role: session.role, tenantId });
    if (tenantId) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: session.userId,
        event_type: EVENT_TYPES.AUTH_LOGOUT,
        entity_type: 'user',
        entity_id: session.userId,
        metadata: {
          role: session.role
        }
      });
    }
  }
  await deleteSession();
  redirect("/login");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session?.userId) {
    const tenantId = await getTenantIdForUser(session.userId);
    log.info("User logged out", { userId: session.userId, role: session.role, tenantId });
    if (tenantId) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: session.userId,
        event_type: EVENT_TYPES.AUTH_LOGOUT,
        entity_type: 'user',
        entity_id: session.userId,
        metadata: {
          role: session.role
        }
      });
    }
  }
  await deleteSession();
  redirect("/");
}
