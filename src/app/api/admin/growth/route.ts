import { NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analyticsService";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const health = await AnalyticsService.getAdminSystemHealth();
    
    const supabase = await getSupabaseServer();
    
    // New Tenants Last 30 Days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: newTenants30d } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

    // Referrals by status
    const { data: referralStats } = await supabase
        .from("referrals")
        .select("status");
        
    const referralsByStatus = referralStats?.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {}) || {};

    return NextResponse.json({
      newTenantsToday: health.growth.newTenantsToday,
      totalReferrals: health.growth.totalReferrals,
      rewardedReferrals: health.growth.rewardedReferrals || 0,
      newTenants30d: newTenants30d || 0,
      referralsByStatus
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
