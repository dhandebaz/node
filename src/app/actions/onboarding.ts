"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { BusinessType } from "@/types";
import { ControlService } from "@/lib/services/controlService";
import { ReferralService } from "@/lib/services/referralService";
import { businessDetailsSchema } from "@/lib/validations/onboarding";

export async function completeOnboarding(
  businessType: BusinessType,
  details?: { propertyCount: number; platforms: string[] }
) {
  // Check Global Kill Switch for Signups
  await ControlService.checkAction(null, "signup");

  // Validate inputs
  if (details) {
    const result = businessDetailsSchema.safeParse(details);
    if (!result.success) {
        throw new Error(`Validation Error: ${result.error.issues[0]?.message || "Invalid input"}`);
    }
  }

  const supabase = await getSupabaseServer();
  const admin = await getSupabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Validate business_type
  if (!businessType) {
    throw new Error("Business type is required for AI Employee");
  }

  // 1. Handle Tenant Creation/Retrieval
  let tenantId: string;
  
  // Check for existing tenant membership
  const { data: existingMembership } = await admin
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    tenantId = existingMembership.tenant_id;
    
    // Update business type if provided (Repair/Migration scenario)
    const { error: updateError } = await admin
      .from("tenants")
      .update({ 
        business_type: businessType,
        // Omitted property_count and platforms as columns do not exist
      })
      .eq("id", tenantId);

    if (updateError) {
      console.error("Failed to update tenant details:", updateError);
      // Don't fail the whole process if this is just an update
    }
  } else {
    // Create new tenant
    // Use user metadata for name if available, else default
    const tenantName = user.user_metadata?.full_name 
      ? `${user.user_metadata.full_name}'s Workspace` 
      : "My Workspace";

    const { data: newTenant, error: tenantError } = await admin
      .from("tenants")
      .insert({
        name: tenantName,
        owner_user_id: user.id,
        business_type: businessType,
      })
      .select("id")
      .single();

    if (tenantError || !newTenant) {
      console.error("Failed to create tenant:", tenantError);
      // Check for specific error like missing column
      if (tenantError?.code === "42703") { // undefined_column
         throw new Error("Database schema mismatch. Please contact support.");
      }
      throw new Error(`Failed to initialize workspace: ${tenantError?.message || "Unknown error"}`);
    }

    tenantId = newTenant.id;

    // Create membership
    const { error: memberError } = await admin
      .from("tenant_users")
      .insert({
        tenant_id: tenantId,
        user_id: user.id,
        role: "owner"
      });

    if (memberError) {
      console.error("Failed to create tenant membership:", memberError);
      // Try to cleanup tenant? Or just fail. 
      // For now, fail loud.
      throw new Error("Failed to set up workspace access");
    }

    // 1.5. Track Referral (Quietly)
    try {
       const cookieStore = await cookies();
       const referralCode = cookieStore.get("nodebase-referral-code")?.value;
       
       if (referralCode) {
         console.log(`[Onboarding] Tracking referral: ${referralCode} for tenant ${tenantId}`);
         await ReferralService.trackReferral(tenantId, referralCode);
         // Clear cookie
         cookieStore.set("nodebase-referral-code", "", { maxAge: 0, path: "/" });
       }
    } catch (e) {
      console.error("Failed to track referral:", e);
      // Don't fail onboarding for this
    }
  }

  // 2. Set Tenant Cookie
  const cookieStore = await cookies();
  cookieStore.set("nodebase-tenant-id", tenantId, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true, // Not accessible via JS, safer
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  // 3. Update/Create Account Status
  // Check if account exists
  const { data: existingAccount } = await admin
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;

  if (existingAccount) {
    // Update existing
    const { error: updateError } = await admin
      .from("accounts")
      .update({
        product_type: "ai_employee",
        business_type: businessType,
        onboarding_status: "complete",
        tenant_id: tenantId, // Link account to tenant
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
    error = updateError;
  } else {
    // Insert new
    const { error: insertError } = await admin
      .from("accounts")
      .insert({
        user_id: user.id,
        product_type: "ai_employee",
        business_type: businessType,
        onboarding_status: "complete",
        tenant_id: tenantId // Link account to tenant
      });
    error = insertError;
  }

  if (error) {
    console.error("Onboarding error:", error);
    throw new Error("Failed to save selection");
  }
  
  console.log(`[Onboarding] User ${user.id} selected ai_employee. Tenant ${tenantId} active.`);

  // 4. Legacy/Compatibility: Ensure kaisa_account exists for AI Employee
  const { data: kaisaAccount } = await admin
    .from("kaisa_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (!kaisaAccount) {
    console.log(`[Onboarding] Creating default kaisa_account for ${user.id}`);
    await admin.from("kaisa_accounts").insert({
        user_id: user.id,
        tenant_id: tenantId, // Link to tenant
        status: "active",
        business_type: businessType
    });
  } else {
    // Update existing if needed
    await admin
      .from("kaisa_accounts")
      .update({ tenant_id: tenantId, business_type: businessType })
      .eq("id", kaisaAccount.id);
  }

  revalidatePath("/", "layout");
  
  return { success: true };
}
