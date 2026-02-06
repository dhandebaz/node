"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { kaisaService } from "@/lib/services/kaisaService";
import { userService } from "@/lib/services/userService";
import { dcService } from "@/lib/services/datacenterService";
import { nodeService } from "@/lib/services/nodeService";
import { spaceService } from "@/lib/services/spaceService";

// Dashboard Overview
export async function getAdminDashboardStats() {
    const supabase = await getSupabaseServer();
    const [
        { count: userCount },
        { count: nodeCount },
        { count: activeNodeCount },
        { data: dcs },
        { data: recentLogs }
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("nodes").select("*", { count: "exact", head: true }),
        supabase.from("nodes").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("datacenters").select("total_capacity, active_nodes"),
        supabase.from("admin_audit_logs").select("*").order("timestamp", { ascending: false }).limit(5)
      ]);
    
      const totalCapacity = dcs?.reduce((acc, dc) => acc + dc.total_capacity, 0) || 0;
      const totalActiveNodes = dcs?.reduce((acc, dc) => acc + dc.active_nodes, 0) || 0;
      const capacityUsage = totalCapacity > 0 ? Math.round((totalActiveNodes / totalCapacity) * 100) : 0;

      return { userCount, nodeCount, activeNodeCount, recentLogs, capacityUsage, totalActiveNodes, totalCapacity };
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

// Nodes Page
export async function getNodesPageData(filters?: any) {
    const [nodes, dcs, users] = await Promise.all([
        nodeService.getAll(filters),
        dcService.getAll(),
        userService.getUsers()
    ]);
    return { nodes, dcs, users };
}

// Node Detail
export async function getNodeDetailData(id: string) {
    const node = await nodeService.getById(id);
    if (!node) return null;
    const [dc, user, logs] = await Promise.all([
        dcService.getById(node.infrastructure.dcId),
        userService.getUserById(node.participant.userId),
        nodeService.getAuditLogs(id)
    ]);
    return { node, dc, user, logs };
}

// Datacenters Page
export async function getDatacentersPageData() {
    return await dcService.getAll();
}

// Datacenter Detail
export async function getDatacenterDetailData(id: string) {
    const [dc, logs] = await Promise.all([
        dcService.getById(id),
        dcService.getAuditLogs(id)
    ]);
    return { dc, logs };
}

// Users Page
export async function getUsersPageData(filters?: any) {
    return await userService.getUsers(filters);
}

// User Detail
export async function getUserDetailData(id: string) {
    const [user, auditLogs, nodes, spaceServices] = await Promise.all([
        userService.getUserById(id),
        userService.getAuditLogs(id),
        nodeService.getByUserId(id),
        spaceService.getUserServices(id)
    ]);
    return { user, auditLogs, nodes, spaceServices };
}

// Create Node Page
export async function getCreateNodePageData() {
    const [users, dcs] = await Promise.all([
        userService.getUsers(),
        dcService.getAll()
    ]);
    return { users, dcs };
}
