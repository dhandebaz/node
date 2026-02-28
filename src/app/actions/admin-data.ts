"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { kaisaService } from "@/lib/services/kaisaService";
import { userService } from "@/lib/services/userService";

// Dashboard Overview
export async function getAdminDashboardStats() {
    const supabase = await getSupabaseServer();
    const [
        { count: userCount },
        { data: recentLogs }
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("admin_audit_logs").select("*").order("timestamp", { ascending: false }).limit(5)
      ]);
    
      return { userCount, recentLogs };
}

// Kaisa Page
export async function getKaisaPageData() {
    const [config, stats, allUsers, logs] = await Promise.all([
        kaisaService.getConfig(),
        kaisaService.getStats(),
        userService.getUsers(),
        kaisaService.getAuditLogs()
    ]);
    // Note: User filtering logic moved to component or done here?
    // Doing it here is safer/faster
    const kaisaUsers = allUsers.filter(u => u.roles.isKaisaUser);
    return { config, stats, kaisaUsers, logs };
}

// Users Page
export async function getUsersPageData(filters?: any) {
    return await userService.getUsers(filters);
}

// User Detail
export async function getUserDetailData(id: string) {
    const [user, auditLogs] = await Promise.all([
        userService.getUserById(id),
        userService.getAuditLogs(id)
    ]);
    return { user, auditLogs };
}

