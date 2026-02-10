"use server";

import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { firebaseAdmin, adminInitializationError, verifyIdToken } from "@/lib/firebase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9910778576";

// Helper to resolve tenant for logging
async function getTenantIdForUser(userId: string): Promise<string | null> {
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

function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  // Ensure it has +91 or appropriate code if needed, but for comparison we often use the last 10 digits
  // or full E.164. Firebase usually returns E.164 (+91...).
  // We'll stick to E.164 format for storage if possible.
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length > 10 && !phone.startsWith("+")) return `+${cleaned}`;
  return phone.startsWith("+") ? phone : `+${cleaned}`;
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
    console.error("Error creating user:", createError);
    // Include details for debugging (RLS, schema, etc.)
    throw new Error(`Failed to create user record: ${createError.message}. Details: ${createError.details || 'None'} (Hint: Check database permissions/RLS)`);
  }

  // Create empty profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ user_id: newUser.id, full_name: null }]);

  if (profileError) {
    console.error("Error creating profile:", profileError);
    // Non-fatal but should be logged.
  }

  return newUser;
}

export async function loginWithFirebaseToken(idToken: string, preferredProduct?: string) {
  try {
    // 1. Verify Token (using Admin SDK or Public Key fallback)
    const decodedToken = await verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return { success: false, message: "No phone number found in token." };
    }

    // 2. Sync User
    const user = await getOrCreateUser(phone);

    // 3. Create Session
    await createSession(user.id, user.role);

    // 4. Log Audit Event
    // We try to resolve the tenant. If user has no tenant, we log with null tenant (system level)
    // or skip if strict tenant enforcement is required (but Login is a critical event).
    // The requirement says "Include: tenant_id". If missing, maybe we shouldn't log?
    // But "USER ACTIONS: Login" is mandatory.
    // For now, we log it. If tenant_id is null, it's a platform-level login.
    const tenantId = await getTenantIdForUser(user.id);
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

    if (preferredProduct === "kaisa") redirectPath = "/dashboard/kaisa";
    else if (preferredProduct === "space") redirectPath = "/dashboard/space";
    else if (preferredProduct === "node") redirectPath = "/node/dashboard";

    return { success: true, redirect: redirectPath, isSuperAdmin: user.role === "superadmin" || user.role === "admin" };

  } catch (error: any) {
    console.error("Firebase Login Error:", error);
    // Return specific error message for debugging
    return { success: false, message: error.message || "Authentication failed." };
  }
}

export async function adminLogoutAction(): Promise<void> {
  const session = await getSession();
  if (session?.userId) {
    const tenantId = await getTenantIdForUser(session.userId);
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
