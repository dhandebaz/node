import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: membershipId } = await params;
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

    // Verify the requesting user has permission (owner or admin)
    const { data: requesterMembership } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      !requesterMembership ||
      !["owner", "admin"].includes(requesterMembership.role)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only owners and admins can remove members" },
        { status: 403 },
      );
    }

    // Fetch the target membership to verify it belongs to this tenant
    const { data: targetMembership, error: fetchError } = await supabase
      .from("tenant_users")
      .select("id, user_id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!targetMembership) {
      // Also check pending invitations
      const { data: invite, error: inviteError } = await supabase
        .from("tenant_invitations")
        .select("id, email")
        .eq("id", membershipId)
        .eq("tenant_id", tenantId)
        .eq("status", "pending")
        .maybeSingle();

      if (inviteError) {
        return NextResponse.json(
          { error: inviteError.message },
          { status: 500 },
        );
      }

      if (!invite) {
        return NextResponse.json(
          { error: "Member or invitation not found" },
          { status: 404 },
        );
      }

      // Cancel the pending invitation
      const { error: cancelError } = await admin
        .from("tenant_invitations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", membershipId);

      if (cancelError) {
        return NextResponse.json(
          { error: cancelError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: `Invitation to ${invite.email} cancelled`,
      });
    }

    // Prevent removing the owner
    if (targetMembership.role === "owner") {
      return NextResponse.json(
        { error: "The workspace owner cannot be removed" },
        { status: 403 },
      );
    }

    // Prevent admins from removing other admins (only owner can do that)
    if (
      targetMembership.role === "admin" &&
      requesterMembership.role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Only the workspace owner can remove admin members" },
        { status: 403 },
      );
    }

    // Prevent self-removal via this endpoint (use a separate "leave" flow)
    if (targetMembership.user_id === user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot remove yourself. Use the Leave Workspace option instead.",
        },
        { status: 400 },
      );
    }

    // Remove the member from the tenant
    const { error: deleteError } = await admin
      .from("tenant_users")
      .delete()
      .eq("id", membershipId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Member removed from workspace",
    });
  } catch (error: any) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
