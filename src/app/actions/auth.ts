"use server";

import { createSession, deleteSession } from "@/lib/auth/session";
import { generateAndSendOTP, verifyOTP } from "@/lib/auth/otp";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/userService";

// Super Admin Configuration (Should be in env vars)
const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9910778576";

export async function sendOtpAction(phone: string) {
  // 1. Validate Phone Format (Basic)
  const cleanPhone = phone.replace(/\D/g, "");
  
  // 2. Check if user exists (Admin or Customer)
  const isSuperAdmin = cleanPhone === SUPER_ADMIN_PHONE;
  const users = await userService.getUsers();
  const user = users.find(u => u.identity.phone.replace(/\D/g, "") === cleanPhone);

  if (!isSuperAdmin && !user) {
    // Return success to prevent enumeration, but do nothing
    return { success: true, message: "OTP sent if number is registered." };
  }

  // 3. Generate and Send OTP
  const sent = await generateAndSendOTP(cleanPhone);
  
  if (!sent) {
    return { success: false, message: "Failed to send OTP. Try again." };
  }

  return { success: true, message: "OTP sent successfully." };
}

export async function verifyOtpAction(phone: string, otp: string, preferredProduct?: "kaisa" | "space" | "node") {
  // Normalize phone to last 10 digits for consistent matching
  const cleanPhone = phone.replace(/\D/g, "");
  const last10Phone = cleanPhone.slice(-10);
  const superAdminPhoneLast10 = SUPER_ADMIN_PHONE.replace(/\D/g, "").slice(-10);
  const normalizedPreferredProduct = preferredProduct?.trim().toLowerCase();

  console.log(`[Auth] Verify OTP for ${cleanPhone} (Last 10: ${last10Phone}) with preferredProduct: ${preferredProduct} (Normalized: ${normalizedPreferredProduct})`);

  // 1. Verify OTP
  // Pass the full clean phone to OTP service, let it handle its own normalization or matching
  // Note: For dev backdoor to work with +91, we might need to handle it in verifyOTP or here.
  // But if the user is succeeding, we assume OTP is valid.
  const result = await verifyOTP(cleanPhone, otp);

  if (!result.valid) {
    return { success: false, message: "Invalid OTP or expired." };
  }

  // 2. Identify User & Role
  let userId = "";
  let role = "user";
  let redirectPath = "/dashboard";

  // Check if it matches Super Admin (comparing last 10 digits)
  if (last10Phone === superAdminPhoneLast10) {
    userId = "ADMIN-001";
    role = "superadmin";
    
    // Allow Admin to access specific dashboards if requested via pill switcher
    console.log(`[Auth] SuperAdmin Login. Preferred: ${normalizedPreferredProduct}`);
    
    if (normalizedPreferredProduct === "kaisa") {
        redirectPath = "/dashboard/kaisa";
    } else if (normalizedPreferredProduct === "space") {
        redirectPath = "/dashboard/space";
    } else if (normalizedPreferredProduct === "node") {
        redirectPath = "/node/dashboard";
    } else {
        console.log(`[Auth] No preferred product matched. Defaulting to /admin`);
        redirectPath = "/admin";
    }
  } else {
    const users = await userService.getUsers();
    // Match user by last 10 digits of phone
    const user = users.find(u => u.identity.phone.replace(/\D/g, "").slice(-10) === last10Phone);
    
    if (!user) {
      return { success: false, message: "Access Denied. User not found." };
    }
    userId = user.identity.id;
    
    // Smart Redirect Logic
    if (normalizedPreferredProduct) {
        // Try to respect preference first
        if (normalizedPreferredProduct === "kaisa" && user.roles.isKaisaUser) {
            redirectPath = "/dashboard/kaisa";
        } else if (normalizedPreferredProduct === "space" && user.roles.isSpaceUser) {
            redirectPath = "/dashboard/space";
        } else if (normalizedPreferredProduct === "node" && user.roles.isNodeParticipant) {
            redirectPath = "/node/dashboard";
        } else {
             // Fallback if preference is invalid/unauthorized
             // Default logic: Multi-product -> Switcher, Single -> Direct
             const products = [
                user.roles.isKaisaUser ? "kaisa" : null,
                user.roles.isSpaceUser ? "space" : null,
                user.roles.isNodeParticipant ? "node" : null
             ].filter(Boolean);

             if (products.length > 1) {
                 redirectPath = "/dashboard";
             } else if (user.roles.isKaisaUser) {
                 redirectPath = "/dashboard/kaisa";
             } else if (user.roles.isSpaceUser) {
                 redirectPath = "/dashboard/space";
             } else if (user.roles.isNodeParticipant) {
                 redirectPath = "/node/dashboard";
             }
        }
    } else {
        // No preference provided (legacy behavior updated)
        const products = [
            user.roles.isKaisaUser,
            user.roles.isSpaceUser,
            user.roles.isNodeParticipant
        ].filter(Boolean);

        if (products.length > 1) {
            redirectPath = "/dashboard";
        } else if (user.roles.isKaisaUser) {
            redirectPath = "/dashboard/kaisa";
        } else if (user.roles.isSpaceUser) {
            redirectPath = "/dashboard/space";
        } else if (user.roles.isNodeParticipant) {
            redirectPath = "/node/dashboard";
        }
    }
  }

  console.log(`[Auth] Redirecting to: ${redirectPath}`);

  // 3. Create Session
  await createSession(userId, role);

  // 4. Return success with redirect path and super admin flag
  return { 
    success: true, 
    redirect: redirectPath,
    isSuperAdmin: role === "superadmin"
  };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login"); // Redirect to public login
}

export async function adminLogoutAction() {
  await deleteSession();
  redirect("/login");
}
