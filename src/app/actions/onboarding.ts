"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { BusinessType } from "@/types";
import { ControlService } from "@/lib/services/controlService";
import { ReferralService } from "@/lib/services/referralService";

export async function completeOnboarding(
  productType: "ai_employee" | "space", 
  businessType?: BusinessType,
  details?: { propertyCount: number; platforms: string[] }
) {
  // Check Global Kill Switch for Signups
  await ControlService.checkAction(null, "signup");

  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Validate business_type
  if (productType === "ai_employee" && !businessType) {
    throw new Error("Business type is required for AI Employee");
  }
  if (productType === "space" && businessType) {
    throw new Error("Business type should not be provided for Nodebase Space");
  }

  // 1. Handle Tenant Creation/Retrieval
  let tenantId: string;
  
  // Check for existing tenant membership
  const { data: existingMembership } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    tenantId = existingMembership.tenant_id;
    
    // Update business type if provided (Repair/Migration scenario)
    if (businessType) {
      await supabase
        .from("tenants")
        .update({ 
          business_type: businessType,
          ...(details ? { 
            property_count: details.propertyCount,
            platforms: details.platforms 
          } : {})
        })
        .eq("id", tenantId);
    }
  } else {
    // Create new tenant
    // Use user metadata for name if available, else default
    const tenantName = user.user_metadata?.full_name 
      ? `${user.user_metadata.full_name}'s Workspace` 
      : "My Workspace";

    const { data: newTenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: tenantName,
        owner_user_id: user.id,
        business_type: businessType || null,
        ...(details ? { 
          property_count: details.propertyCount,
          platforms: details.platforms 
        } : {})
      })
      .select("id")
      .single();

    if (tenantError || !newTenant) {
      console.error("Failed to create tenant:", tenantError);
      throw new Error("Failed to initialize workspace");
    }

    tenantId = newTenant.id;

    // Create membership
    const { error: memberError } = await supabase
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
  const { data: existingAccount } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;

  if (existingAccount) {
    // Update existing
    const { error: updateError } = await supabase
      .from("accounts")
      .update({
        product_type: productType,
        onboarding_status: "complete",
        tenant_id: tenantId, // Link account to tenant
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
    error = updateError;
  } else {
    // Insert new
    const { error: insertError } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        product_type: productType,
        onboarding_status: "complete",
        tenant_id: tenantId // Link account to tenant
      });
    error = insertError;
  }

  if (error) {
    console.error("Onboarding error:", error);
    throw new Error("Failed to save selection");
  }
  
  console.log(`[Onboarding] User ${user.id} selected ${productType}. Tenant ${tenantId} active.`);

  // 4. Legacy/Compatibility: Ensure kaisa_account exists for AI Employee
  if (productType === "ai_employee") {
     const { data: kaisaAccount } = await supabase
        .from("kaisa_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
     
     if (!kaisaAccount) {
        console.log(`[Onboarding] Creating default kaisa_account for ${user.id}`);
        await supabase.from("kaisa_accounts").insert({
            user_id: user.id,
            tenant_id: tenantId, // Link to tenant
            status: "active",
            business_type: "hospitality" // default
        });
     } else if (!kaisaAccount.tenant_id) {
        // Backfill tenant_id if missing
        await supabase
          .from("kaisa_accounts")
          .update({ tenant_id: tenantId })
          .eq("id", kaisaAccount.id);
     }
  }

  revalidatePath("/", "layout");
  
  if (productType === "ai_employee") {
    console.log(`[Onboarding] Redirecting to /dashboard/ai`);
    redirect("/dashboard/ai");
  } else {
    console.log(`[Onboarding] Redirecting to /dashboard/space`);
    redirect("/dashboard/space");
  }
}
