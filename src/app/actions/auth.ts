"use server";

import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { verifyIdToken } from "@/lib/firebase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { userLoginSchema } from "@/lib/validation/auth";
import { log } from "@/lib/logger";
import { z } from "zod";

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

async function getOrCreateUser(phone: string) {
  const supabase = await getSupabaseServer();
  // 1. Check if user exists in Supabase public.users
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // 2. If not, create user
  // Determine role
  const cleanPhone = phone.replace(/\D/g, "");
  const superAdminClean = SUPER_ADMIN_PHONE.replace(/\D/g, "");
  const role = cleanPhone.endsWith(superAdminClean.slice(-10)) ? "superadmin" : "customer";

  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert([{ phone, role }])
    .select()
    .single();

  if (createError) {
    log.error(`User Creation Failed for ${phone}`, createError);
    // Include details for debugging (RLS, schema, etc.)
    throw new Error(`Failed to create user record: ${createError.message}. Code: ${createError.code}. Details: ${createError.details || 'None'} (Hint: Check database permissions/RLS or Supabase Logs)`);
  }

  // Create empty profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ user_id: newUser.id, full_name: null }]);

  if (profileError) {
    log.warn("Error creating profile (non-fatal)", profileError);
  }

  return newUser;
}

export async function loginWithFirebaseToken(idToken: string, preferredProduct?: string) {
  try {
    // 0. Validate Input
    const input = userLoginSchema.parse({ idToken, preferredProduct });

    // 1. Verify Token (using Admin SDK or Public Key fallback)
    const decodedToken = await verifyIdToken(input.idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      log.warn("Login failed: Token missing phone number", { uid: decodedToken.uid });
      return { success: false, message: "No phone number found in token." };
    }

    // 2. Sync User
    const user = await getOrCreateUser(phone);

    // 3. Create Session
    await createSession(user.id, user.role);

    // 4. Log Audit Event
    const tenantId = await getTenantIdForUser(user.id);
    log.info("User logged in", { userId: user.id, role: user.role, tenantId });

    if (tenantId) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        actor_id: user.id,
        event_type: EVENT_TYPES.AUTH_LOGIN,
        entity_type: 'user',
        entity_id: user.id,
        metadata: {
          method: 'otp',
          role: user.role
        }
      });
    }

    // 5. Determine Redirect
    let redirectPath = "/dashboard";
    if (user.role === "superadmin" || user.role === "admin") {
      redirectPath = "/admin"; // Default for admin
    }

    if (input.preferredProduct === "kaisa") redirectPath = "/dashboard/kaisa";
    else if (input.preferredProduct === "space") redirectPath = "/dashboard/space";
    else if (input.preferredProduct === "node") redirectPath = "/node/dashboard";

    return { success: true, redirect: redirectPath, isSuperAdmin: user.role === "superadmin" || user.role === "admin" };

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      log.warn("Login validation failed", { errors: error.issues });
      return { success: false, message: "Invalid input parameters." };
    }
    log.error("Firebase Login Error", error);
    // Return specific error message for debugging
    return { success: false, message: error.message || "Authentication failed." };
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
  await import("@/lib/auth/session").then((mod) => mod.deleteSession());
  redirect("/");
}
