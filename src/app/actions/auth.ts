"use server";

import { getSession, deleteSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { log } from "@/lib/logger";

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE;

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

export async function impersonateUserAction(targetUserId: string): Promise<void> {
  const session = await getSession();
  
  if (!session || session.role !== 'superadmin') {
    throw new Error("Unauthorized");
  }

  const supabase = await getSupabaseServer();
  
  // 1. Fetch Target User
  // Use admin client to bypass RLS if needed, but we need to sign in as them.
  // Actually, Supabase doesn't easily support "sign in as" without password.
  // We can create a custom session cookie if we manage sessions manually, 
  // but with Supabase Auth, we might need a custom token generation or just mock the session object if we were using custom auth.
  // Since we rely on Supabase Auth cookies, we can't easily forge a session for another user without their password.
  // ALTERNATIVE: We store an "impersonation_target" in the admin's session metadata 
  // and the middleware/RLS policies would need to respect it (Complex).
  
  // SIMPLER APPROACH for this architecture:
  // We can't truly "login" as them without their password in Supabase.
  // However, we can build a "View As" mode where the Admin UI fetches data *on behalf of* the user using Admin privileges,
  // but renders the Customer Dashboard components.
  // Or, simpler: We generate a magic link for that user and redirect to it? No, requires email access.
  
  // ACTUALLY: We can use `supabase.auth.admin.generateLink({ type: 'magiclink', email: ... })`
  // and redirect the admin to that link. This logs them in as the user.
  // Prerequisite: We need the user's email.
  
  const { data: userData, error } = await supabase.auth.admin.getUserById(targetUserId);
  if (error || !userData?.user) throw new Error("User not found");
  
  const user = userData.user;
  
  if (!user.email) throw new Error("User has no email to generate login link");

  // Log the impersonation event
  const tenantId = await getTenantIdForUser(session.userId);
  await logEvent({
      tenant_id: tenantId || 'system',
      actor_type: 'admin',
      actor_id: session.userId,
      event_type: EVENT_TYPES.ADMIN_USER_IMPERSONATED,
      entity_type: 'user',
      entity_id: targetUserId,
      metadata: { target_email: user.email }
  });

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
        redirectTo: '/dashboard/ai'
    }
  });

  if (linkError || !linkData.properties?.action_link) {
      throw new Error("Failed to generate access link");
  }

  // Redirect Admin to the user's login link
  // Note: This will overwrite the Admin's session cookies with the User's session.
  // They will need to logout and login as Admin again to return.
  redirect(linkData.properties.action_link);
}
