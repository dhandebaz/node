import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Only owners and admins can invite
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only owners and admins can invite members" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { email, role } = body as { email?: string; role?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 },
      );
    }

    const normalizedRole = role === "admin" ? "admin" : "member";
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already belongs to this tenant
    const { data: existingUser } = await admin.auth.admin.listUsers();
    const existingAuthUser = existingUser?.users?.find(
      (u) => u.email === normalizedEmail,
    );

    if (existingAuthUser) {
      const { data: existingMembership } = await supabase
        .from("tenant_users")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("user_id", existingAuthUser.id)
        .maybeSingle();

      if (existingMembership) {
        return NextResponse.json(
          { error: "This user is already a member of your workspace" },
          { status: 409 },
        );
      }
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabase
      .from("tenant_invitations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 409 },
      );
    }

    // Get tenant name for the invite email
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", tenantId)
      .single();

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.nodebase.co";
    const redirectTo = `${appUrl}/onboarding?invited=1&tenant=${tenantId}`;

    // Record the invitation in DB first
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const { data: inviteRecord, error: inviteInsertError } = await admin
      .from("tenant_invitations")
      .insert({
        tenant_id: tenantId,
        invited_by: user.id,
        email: normalizedEmail,
        role: normalizedRole,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (inviteInsertError) {
      console.error("Failed to create invitation record:", inviteInsertError);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 },
      );
    }

    // Send invite via Supabase Auth (creates user and sends magic link)
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        redirectTo: `${redirectTo}&invite_id=${inviteRecord.id}`,
        data: {
          invited_to_tenant: tenantId,
          invited_role: normalizedRole,
          tenant_name: tenant?.name || "Nodebase",
          invite_id: inviteRecord.id,
        },
      },
    );

    if (inviteError) {
      // Clean up the DB record if Supabase invite fails
      await admin
        .from("tenant_invitations")
        .delete()
        .eq("id", inviteRecord.id);

      console.error("Supabase invite error:", inviteError);
      return NextResponse.json(
        { error: inviteError.message || "Failed to send invitation email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${normalizedEmail}`,
      inviteId: inviteRecord.id,
    });
  } catch (error: any) {
    console.error("Invite team member error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
