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

    let query = supabase.from("tenants").select("*", { count: "exact" });

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

    return NextResponse.json({
      tenants: tenants || [],
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
