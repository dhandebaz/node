"use server";

import { createSession, deleteSession } from "@/lib/auth/session";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9910778576";

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
    throw new Error("Failed to create user record.");
  }

  // Create empty profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ user_id: newUser.id, full_name: null }]);

  if (profileError) {
    console.error("Error creating profile:", profileError);
    // Non-fatal but should be logged. In strict mode, we might want to revert user creation.
  }

  return newUser;
}

export async function loginWithFirebaseToken(idToken: string, preferredProduct?: string) {
  try {
    if (!firebaseAdmin.apps.length) {
        console.error("Firebase Admin apps length is 0. Initialization failed.");
        return { success: false, message: "Server Configuration Error: Firebase Admin not initialized." };
    }

    // 1. Verify Token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return { success: false, message: "No phone number found in token." };
    }

    // 2. Sync User
    const user = await getOrCreateUser(phone);

    // 3. Create Session
    await createSession(user.id, user.role);

    // 4. Determine Redirect
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
  await deleteSession();
  redirect("/login");
}

export async function logoutAction(): Promise<void> {
  await import("@/lib/auth/session").then((mod) => mod.deleteSession());
  redirect("/");
}
