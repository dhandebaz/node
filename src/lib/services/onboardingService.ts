import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BusinessType } from "@/types";

export type OnboardingStep = "business_type" | "details" | "processing" | "ready";

export interface OnboardingStatus {
  step: OnboardingStep;
  tenantId: string | null;
  businessType: BusinessType | null;
  isComplete: boolean;
}

export class OnboardingService {
  /**
   * Get the current onboarding status for a user.
   * This is the single source of truth for the entire app.
   */
  static async getStatus(userId: string, supabase?: any): Promise<OnboardingStatus> {
    const client = supabase || (await getSupabaseServer());
    
    // 1. Fetch Account & Tenant Membership in parallel
    const [accountRes, membershipRes] = await Promise.all([
      client
        .from("accounts")
        .select("onboarding_status, tenant_id, business_type")
        .eq("user_id", userId)
        .maybeSingle(),
      client
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", userId)
        .maybeSingle()
    ]);

    const account = accountRes.data;
    const membership = membershipRes.data;
    const tenantId = membership?.tenant_id || account?.tenant_id || null;
    const businessType = account?.business_type as BusinessType | null;

    // 2. Determine Step
    let step: OnboardingStep = "business_type";
    
    if (businessType) {
      step = "details";
    }

    const isComplete = 
      account?.onboarding_status === "complete" && 
      !!tenantId && 
      !!businessType;

    if (isComplete) {
      step = "ready";
    } else if (account?.onboarding_status === "complete") {
      // Data inconsistency: status says complete but missing critical pieces
      // Fallback to processing or details
      step = businessType ? "details" : "business_type";
    }

    return {
      step,
      tenantId,
      businessType,
      isComplete
    };
  }

  /**
   * Mark onboarding as complete and sync all related tables.
   */
  static async finalizeOnboarding(userId: string, tenantId: string, businessType: BusinessType) {
    const admin = await getSupabaseAdmin();

    // 1. Update Account
    const { error: accountError } = await admin
      .from("accounts")
      .update({
        onboarding_status: "complete",
        tenant_id: tenantId,
        business_type: businessType,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (accountError) throw accountError;

    // 2. Sync User Metadata for Middleware/Auth
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { onboarding_status: "complete" }
    });

    // 3. Ensure Kaisa Account exists
    await admin.from("omni_accounts").upsert({
      user_id: userId,
      tenant_id: tenantId,
      status: "active",
      business_type: businessType,
      role: "manager"
    }, { onConflict: 'user_id' });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard", "layout");
    
    return { success: true };
  }
}
