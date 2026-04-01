import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const kyc_status = searchParams.get("kyc_status") || "all";
    const search = searchParams.get("search") || "";

    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("tenants")
      .select(`
        id,
        name,
        username,
        phone,
        timezone,
        business_type,
        kyc_status,
        kyc_verified_at,
        created_at,
        is_ai_enabled,
        is_messaging_enabled,
        is_bookings_enabled,
        is_wallet_enabled,
        early_access,
        owner_user_id,
        users:users!tenants_owner_user_id_fkey(
          id,
          email,
          name
        )
      `, { count: "exact" });

    if (status === "active") {
      query = query.eq("kyc_status", "verified");
    } else if (status === "suspended") {
      query = query.in("kyc_status", ["rejected", "suspended"]);
    }

    if (kyc_status !== "all") {
      query = query.eq("kyc_status", kyc_status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: tenants, count, error } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch tenants:", error);
      return NextResponse.json(
        { error: "Failed to fetch tenants" },
        { status: 500 }
      );
    }

    const tenantsWithOwner = tenants?.map((t: any) => ({
      id: t.id,
      name: t.name,
      username: t.username,
      phone: t.phone,
      timezone: t.timezone,
      business_type: t.business_type,
      kyc_status: t.kyc_status,
      kyc_verified_at: t.kyc_verified_at,
      created_at: t.created_at,
      is_ai_enabled: t.is_ai_enabled,
      is_messaging_enabled: t.is_messaging_enabled,
      is_bookings_enabled: t.is_bookings_enabled,
      is_wallet_enabled: t.is_wallet_enabled,
      early_access: t.early_access,
      owner_email: t.users?.email || null,
      owner_name: t.users?.name || null,
    })) || [];

    return NextResponse.json({
      tenants: tenantsWithOwner,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
