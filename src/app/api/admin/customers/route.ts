import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const [{ data: accounts, error: accountsError }, { data: users, error: usersError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase
        .from("kaisa_accounts")
        .select("user_id, status, wallet_balance, created_at, plan_price, ai_manager_slug"),
      supabase.from("users").select("id, phone, created_at"),
      supabase.from("profiles").select("user_id, business_name")
    ]);

    if (accountsError || usersError || profilesError) {
      return NextResponse.json({ error: accountsError?.message || usersError?.message || profilesError?.message }, { status: 500 });
    }

    const usersById = new Map((users || []).map((user: any) => [user.id, user]));
    const profilesByUser = new Map((profiles || []).map((profile: any) => [profile.user_id, profile]));

    const customers = (accounts || []).map((account: any) => {
      const user = usersById.get(account.user_id);
      const profile = profilesByUser.get(account.user_id);
      return {
        id: account.user_id,
        businessName: profile?.business_name || "Unassigned",
        phone: user?.phone || "",
        aiManager: account.ai_manager_slug || null,
        planPrice: Number(account.plan_price || 0),
        walletBalance: Number(account.wallet_balance || 0),
        status: account.status || "active",
        createdAt: account.created_at || user?.created_at || null
      };
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load customers" }, { status: 500 });
  }
}
