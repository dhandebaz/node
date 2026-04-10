
"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { omniService } from "@/lib/services/omniService";
import { userService } from "@/lib/services/userService";

// Dashboard Overview
export async function getAdminDashboardStats() {
    const supabase = await getSupabaseServer();
    
    // Quick totals from raw tables for speed
    const [stats, usersCount] = await Promise.all([
        omniService.getStats(),
        supabase.from("profiles").select("*", { count: "exact", head: true })
    ]);

    return {
        stats,
        totalProfiles: usersCount.count || 0
    };
}

// Omni Core Admin Data
export async function getOmniAdminData() {
    const [config, stats, allUsers, logs] = await Promise.all([
        omniService.getConfig(),
        omniService.getStats(),
        userService.getUsers(),
        omniService.getAuditLogs()
    ]);
    
    const omniUsers = allUsers.filter((u: any) => u.roles.isOmniUser);
    return { config, stats, omniUsers, logs };
}

// User List (Filterable)
export async function getUsersPageData(filters?: any) {
    return await userService.getUsers(filters);
}

// User Detail
export async function getUserDetailPageData(id: string) {
    const [user, auditLogs] = await Promise.all([
        userService.getUserById(id),
        userService.getAuditLogs(id)
    ]);
    
    return { user, auditLogs };
}
