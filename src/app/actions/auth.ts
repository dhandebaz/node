"use server";

import { createSession } from "@/lib/auth/session";
import { firebaseAdmin } from "@/lib/firebase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
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
  // 1. Check if user exists in Supabase public.users
  const { data: existingUser, error: fetchError } = await supabaseAdmin
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

  const { data: newUser, error: createError } = await supabaseAdmin
    .from("users")
    .insert([{ phone, role }])
    .select()
    .single();

  if (createError) {
    console.error("Error creating user:", createError);
    throw new Error("Failed to create user record.");
  }

  return newUser;
}

export async function loginWithFirebaseToken(idToken: string, preferredProduct?: string) {
  try {
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

  } catch (error) {
    console.error("Firebase Login Error:", error);
    return { success: false, message: "Authentication failed." };
  }
}

export async function sendBackupOtp(phone: string) {
  try {
    const formattedPhone = normalizePhone(phone);
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
        console.error("Supabase OTP Send Error:", error);
        return { success: false, message: error.message };
    }

    return { success: true, message: "OTP sent via backup provider." };
  } catch (error) {
    console.error("Backup OTP Error:", error);
    return { success: false, message: "Failed to send backup OTP." };
  }
}

export async function logoutAction() {
  await import("@/lib/auth/session").then((mod) => mod.deleteSession());
  redirect("/");
}

export async function verifyBackupOtp(phone: string, token: string, preferredProduct?: string) {
  try {
    const formattedPhone = normalizePhone(phone);
    
    // 1. Verify with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });

    if (error || !data.user) {
       return { success: false, message: "Invalid OTP." };
    }

    // 2. Sync User
    // Use the phone from the verified user or the input phone (should be same)
    const verifiedPhone = data.user.phone || formattedPhone;
    const user = await getOrCreateUser(verifiedPhone);

    // 3. Create Session
    await createSession(user.id, user.role);

     // 4. Determine Redirect (Same logic)
    let redirectPath = "/dashboard";
    if (user.role === "superadmin" || user.role === "admin") {
         redirectPath = "/admin";
    }

    if (preferredProduct === "kaisa") redirectPath = "/dashboard/kaisa";
    else if (preferredProduct === "space") redirectPath = "/dashboard/space";
    else if (preferredProduct === "node") redirectPath = "/node/dashboard";

    return { success: true, redirect: redirectPath, isSuperAdmin: user.role === "superadmin" || user.role === "admin" };

  } catch (error) {
    console.error("Backup Verification Error:", error);
    return { success: false, message: "Verification failed." };
  }
}
