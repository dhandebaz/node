"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { BusinessType } from "@/types";
import { ControlService } from "@/lib/services/controlService";
import { ReferralService } from "@/lib/services/referralService";
import { businessDetailsSchema } from "@/lib/validations/onboarding";
import { OnboardingService } from "@/lib/services/onboardingService";

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

  // 3. Finalize Onboarding via Service
  await OnboardingService.finalizeOnboarding(user.id, tenantId, businessType);
  
  console.log(`[Onboarding] User ${user.id} finalized for ${businessType}. Tenant ${tenantId} active.`);
  
  return { success: true };
}

export async function completeMilestone(milestoneId: string) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const admin = await getSupabaseAdmin();
  const { data: account } = await admin
    .from("accounts")
    .select("onboarding_milestones")
    .eq("user_id", user.id)
    .single();

  const currentMilestones = (account?.onboarding_milestones as string[]) || [];
  
  if (!currentMilestones.includes(milestoneId)) {
    const newMilestones = [...currentMilestones, milestoneId];
    await admin
      .from("accounts")
      .update({ onboarding_milestones: newMilestones })
      .eq("user_id", user.id);
    
    revalidatePath("/dashboard/ai");
  }

  return { success: true };
}
