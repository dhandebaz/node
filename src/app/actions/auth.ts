"use server";

import { createSession, deleteSession } from "@/lib/auth/session";
import { generateAndSendOTP, verifyOTP } from "@/lib/auth/otp";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/userService";

// Super Admin Configuration (Should be in env vars)
const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9999999999";

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

export async function verifyOtpAction(phone: string, otp: string) {
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
    redirectPath = "/admin";
  } else {
    const users = await userService.getUsers();
    const user = users.find(u => u.identity.phone.replace(/\D/g, "") === cleanPhone);
    
    if (!user) {
      return { success: false, message: "Access Denied. User not found." };
    }
    userId = user.identity.id;
    // Determine redirect based on products
    if (user.roles.isKaisaUser && user.roles.isSpaceUser) {
        redirectPath = "/dashboard"; // Product Switcher
    } else if (user.roles.isKaisaUser) {
        redirectPath = "/dashboard/kaisa";
    } else if (user.roles.isSpaceUser) {
        redirectPath = "/dashboard/space";
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
