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
  const cleanPhone = phone.replace(/\D/g, "");

  // 1. Verify OTP
  const result = await verifyOTP(cleanPhone, otp);

  if (!result.valid) {
    return { success: false, message: "Invalid OTP or expired." };
  }

  // 2. Identify User & Role
  let userId = "";
  let role = "user";
  let redirectPath = "/dashboard";

  if (cleanPhone === SUPER_ADMIN_PHONE) {
    userId = "ADMIN-001";
    role = "superadmin";
    
    // Allow Admin to access specific dashboards if requested via pill switcher
    if (preferredProduct === "kaisa") {
        redirectPath = "/dashboard/kaisa";
    } else if (preferredProduct === "space") {
        redirectPath = "/dashboard/space";
    } else if (preferredProduct === "node") {
        redirectPath = "/node/dashboard";
    } else {
        redirectPath = "/admin";
    }
  } else {
    const users = await userService.getUsers();
    const user = users.find(u => u.identity.phone.replace(/\D/g, "") === cleanPhone);
    
    if (!user) {
      return { success: false, message: "Access Denied. User not found." };
    }
    userId = user.identity.id;
    
    // Smart Redirect Logic
    if (preferredProduct) {
        // Try to respect preference first
        if (preferredProduct === "kaisa" && user.roles.isKaisaUser) {
            redirectPath = "/dashboard/kaisa";
        } else if (preferredProduct === "space" && user.roles.isSpaceUser) {
            redirectPath = "/dashboard/space";
        } else if (preferredProduct === "node" && user.roles.isNodeParticipant) {
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

  // 3. Create Session
  await createSession(userId, role);

  // 4. Return success with redirect path
  return { success: true, redirect: redirectPath };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login"); // Redirect to public login
}

export async function adminLogoutAction() {
  await deleteSession();
  redirect("/admin/login");
}
