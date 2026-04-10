import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: tenantId } = await params;
    const supabase = await getSupabaseAdmin();

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const { data: users, error: usersError } = await supabase
      .from("tenant_users")
      .select(`
        id,
        role,
        created_at,
        user:users(
          id,
          email,
          name,
          phone,
          avatar_url
        )
      `)
      .eq("tenant_id", tenantId);

    const { data: stats, error: statsError } = await supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId);

    const { count: messagesCount } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId);

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("tenant_id", tenantId)
      .single();

    const { data: recentTransactions } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      tenant,
      users: users || [],
      stats: {
        total_bookings: stats?.length || 0,
        total_messages: messagesCount || 0,
      },
      wallet: wallet || null,
      recent_transactions: recentTransactions || [],
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: tenantId } = await params;
    const body = await request.json();

    const allowedFields = [
      "name",
      "phone",
      "timezone",
      "address",
      "business_type",
      "is_ai_enabled",
      "is_messaging_enabled",
      "is_bookings_enabled",
      "is_wallet_enabled",
      "early_access",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    const { error: updateError } = await supabase
      .from("tenants")
      .update(updateData as any)
      .eq("id", tenantId);

    if (updateError) {
      console.error("Failed to update tenant:", updateError);
      return NextResponse.json(
        { error: "Failed to update tenant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: tenantId } = await params;
    const { reason } = await request.json().catch(() => ({}));

    const supabase = await getSupabaseAdmin();

    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        kyc_status: "suspended",
        suspended_at: new Date().toISOString(),
        suspension_reason: reason || "Suspended by admin",
      } as any)
      .eq("id", tenantId);

    if (updateError) {
      console.error("Failed to suspend tenant:", updateError);
      return NextResponse.json(
        { error: "Failed to suspend tenant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error suspending tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
