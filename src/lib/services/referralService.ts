import { getSupabaseServer } from "@/lib/supabase/server";
import { WalletService } from "./walletService";
import { logEvent } from "./analyticsService"; // Assuming we can log events here, or use a separate logger
import { EVENT_TYPES } from "@/types/events"; // Need to check if this exists or just use string
import { randomBytes } from "crypto";

export class ReferralService {
  private static generateCode(): string {
    // Generate a 8-char random alphanumeric string
    return randomBytes(4).toString('hex').toUpperCase();
  }

  static async getReferralCode(tenantId: string): Promise<string> {
    const supabase = await getSupabaseServer();
    
    // 1. Check existing
    const { data } = await supabase
      .from("tenants")
      .select("referral_code")
      .eq("id", tenantId)
      .single();

    if (data?.referral_code) return data.referral_code;

    // 2. Generate new if missing
    let code = this.generateCode();
    let isUnique = false;
    
    // Simple retry loop for uniqueness
    while (!isUnique) {
      const { data: existing } = await supabase
        .from("tenants")
        .select("id")
        .eq("referral_code", code)
        .single();
        
      if (!existing) isUnique = true;
      else code = this.generateCode();
    }

    const { error } = await supabase
      .from("tenants")
      .update({ referral_code: code })
      .eq("id", tenantId);

    if (error) throw error;
    return code;
  }

  static async trackReferral(newTenantId: string, referralCode: string): Promise<boolean> {
    if (!referralCode) return false;

    const supabase = await getSupabaseServer();

    // 1. Find referrer
    const { data: referrer } = await supabase
      .from("tenants")
      .select("id")
      .eq("referral_code", referralCode)
      .single();

    if (!referrer || referrer.id === newTenantId) return false; // Can't refer self

    // 2. Create link
    const { error } = await supabase
      .from("referrals")
      .insert({
        referrer_tenant_id: referrer.id,
        referred_tenant_id: newTenantId,
        status: 'pending'
      });

    if (error) {
      console.error("Failed to track referral:", error);
      return false;
    }

    return true;
  }

  static async checkAndReward(tenantId: string): Promise<void> {
    const supabase = await getSupabaseServer();

    // 1. Find if this tenant was referred and is pending
    const { data: referral } = await supabase
      .from("referrals")
      .select("id, referrer_tenant_id, status")
      .eq("referred_tenant_id", tenantId)
      .eq("status", "pending")
      .single();

    if (!referral) return;

    // 2. Check "Active" criteria
    // Criteria: Has at least 1 listing created OR > 50 credits used
    const { count: listingCount } = await supabase
      .from("listings")
      .select("*", { count: 'exact', head: true })
      .eq("tenant_id", tenantId);

    // Or check wallet transactions for usage (negative amount)
    // This is heavier, let's stick to "Has Listing" as the "Active" signal for now.
    // It implies they set up the business.
    
    if ((listingCount || 0) > 0) {
       // REWARD!
       const REWARD_AMOUNT = 500; // 500 Credits

       // 1. Update status
       const { error: updateError } = await supabase
         .from("referrals")
         .update({ 
           status: 'rewarded',
           reward_amount: REWARD_AMOUNT
         })
         .eq("id", referral.id);
       
       if (updateError) throw updateError;

       // 2. Credit Referrer
       await WalletService.addCredits(
         referral.referrer_tenant_id, 
         REWARD_AMOUNT, 
         'referral_bonus', 
         { referred_tenant: tenantId }
       );

       // 3. Credit Referee (Optional? "Incentives unlocked ONLY after...". Maybe give them a boost too?)
       // "You earned 500 credits for helping another business..." -> This is for the referrer.
       // Let's stick to rewarding the referrer for now as per UI copy.
    }
  }

  static async getReferralStats(tenantId: string) {
    const supabase = await getSupabaseServer();
    
    const { data: referrals } = await supabase
      .from("referrals")
      .select("status, reward_amount, created_at")
      .eq("referrer_tenant_id", tenantId);

    const totalInvited = referrals?.length || 0; // Only tracks successful signups
    const totalEarned = referrals?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;
    const pending = referrals?.filter(r => r.status === 'pending').length || 0;

    return {
      totalInvited,
      totalEarned,
      pending,
      history: referrals || []
    };
  }

  /**
   * Get or create a referral code for a tenant
   */
  static async getOrCreateReferralCode(tenantId: string): Promise<string> {
    const supabase = await getSupabaseServer();
    
    // 1. Check existing
    const { data: tenant } = await supabase
      .from("tenants")
      .select("referral_code")
      .eq("id", tenantId)
      .single();

    if (tenant?.referral_code) return tenant.referral_code;

    // 2. Generate new
    // Simple 8-char alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // 3. Save (handle collision with simple retry or just fail and let client retry - keeping it simple)
    const { data, error } = await supabase
      .from("tenants")
      .update({ referral_code: code })
      .eq("id", tenantId)
      .select("referral_code")
      .single();

    if (error) {
      // If collision (unlikely with 36^8), we could retry. 
      // For MVP, just try one more time
      const code2 = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data: retryData, error: retryError } = await supabase
        .from("tenants")
        .update({ referral_code: code2 })
        .eq("id", tenantId)
        .select("referral_code")
        .single();
      
      if (retryError || !retryData) throw new Error("Failed to generate referral code");
      return retryData.referral_code;
    }

    return data.referral_code;
  }
}
