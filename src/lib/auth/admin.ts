import { getSession } from "./session";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  // Check role from session first (fast path)
  if (session.role === 'admin' || session.role === 'superadmin') {
    await logAdminAccess(session.userId);
    return session.userId;
  }

  // Verify against database (source of truth)
  const supabase = await getSupabaseServer();
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.userId)
    .single();

  if (error || !user) {
    console.error("Admin check failed: User not found or error", error);
    throw new Error("Forbidden: Admin access required");
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error("Forbidden: Admin access required");
  }

  await logAdminAccess(session.userId);
  return session.userId;
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
    });
  } catch (error) {
    console.error("Failed to log admin access:", error);
    // Don't block admin access if logging fails, but warn
  }
}
