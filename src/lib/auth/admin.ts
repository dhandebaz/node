import { getSession } from "./session";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === 'admin' || session.role === 'superadmin') {
    await logAdminAccess(session.userId);
    return null;
  }

  const supabase = await getSupabaseServer();
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  await logAdminAccess(session.userId);
  return null;
}

async function logAdminAccess(userId: string) {
  try {
    const adminDb = await getSupabaseAdmin();
    await adminDb.from("system_logs").insert({
      severity: "info",
      service: "admin_access",
      message: `Admin access verified for user ${userId}`,
      user_id: userId,
      timestamp: new Date().toISOString()
    } as any);
  } catch (error) {
    console.error("Failed to log admin access:", error);
    // Don't block admin access if logging fails, but warn
  }
}
