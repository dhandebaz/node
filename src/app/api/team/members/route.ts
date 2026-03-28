import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Verify the requesting user belongs to this tenant
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all members of this tenant with their profile data
    const { data: tenantUsers, error: membersError } = await supabase
      .from("tenant_users")
      .select(
        `
        id,
        user_id,
        role,
        created_at,
        users (
          id,
          phone,
          email,
          full_name,
          last_sign_in_at
        )
      `,
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("Failed to fetch team members:", membersError);
      return NextResponse.json(
        { error: membersError.message },
        { status: 500 },
      );
    }

    // Also fetch pending invitations (users invited but not yet joined)
    const { data: invites } = await supabase
      .from("tenant_invitations")
      .select("id, email, role, created_at, expires_at")
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const members = (tenantUsers ?? []).map((tu: any) => {
      const profile = tu.users;
      const name =
        profile?.full_name ||
        profile?.email?.split("@")[0] ||
        "Unknown";
      const lastActive = profile?.last_sign_in_at
        ? new Date(profile.last_sign_in_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : undefined;

      return {
        id: tu.id,
        userId: tu.user_id,
        name,
        email: profile?.email || profile?.phone || " - ",
        role: tu.role as "owner" | "admin" | "member",
        status: "active" as const,
        lastActive,
        joinedAt: tu.created_at,
      };
    });

    // Merge pending invitations as "invited" members
    const invitedMembers = (invites ?? []).map((inv: any) => ({
      id: inv.id,
      userId: null,
      name: inv.email.split("@")[0],
      email: inv.email,
      role: inv.role as "admin" | "member",
      status: "invited" as const,
      lastActive: undefined,
      joinedAt: inv.created_at,
      expiresAt: inv.expires_at,
    }));

    return NextResponse.json({
      members: [...members, ...invitedMembers],
      total: members.length + invitedMembers.length,
    });
  } catch (error: any) {
    console.error("Team members error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
