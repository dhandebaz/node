import {
    KaisaStats,
    KaisaAdminAuditLog,
    KaisaBusinessType
} from "@/types/kaisa";
import { getSupabaseServer } from "@/lib/supabase/server";
import { userService } from "@/lib/services/userService";
import { log } from "@/lib/logger";

export const kaisaAdminService = {
    async getStats(): Promise<KaisaStats> {
        const users = await userService.getUsers();
        // Filter users who have Kaisa product
        const kaisaUsers = users.filter(u => u.roles.isKaisaUser && u.products.kaisa);

        // Initialize stats
        const stats: KaisaStats = {
            totalUsers: kaisaUsers.length,
            activeUsers: kaisaUsers.filter(u => u.status.account === "active").length,
            pausedUsers: kaisaUsers.filter(u => u.status.account === "suspended").length,
            byType: { Doctor: 0, Homestay: 0, Retail: 0, Other: 0 },
            byRole: { owner: 0, manager: 0, "co-founder": 0 },
        };

        // Aggregate stats
        kaisaUsers.forEach(u => {
            const kaisaProduct = u.products.kaisa;
            if (kaisaProduct?.businessType) {
                const type = kaisaProduct.businessType as KaisaBusinessType;
                // Validate type is a known key, else "Other"
                if (Object.prototype.hasOwnProperty.call(stats.byType, type)) {
                    stats.byType[type]++;
                } else {
                    stats.byType.Other++;
                }
            }
            if (kaisaProduct?.role) {
                // Ensure role exists in stats, though TypeScript might complain if types drift
                if (Object.prototype.hasOwnProperty.call(stats.byRole, kaisaProduct.role)) {
                    stats.byRole[kaisaProduct.role]++;
                }
            }
        });

        return stats;
    },

    async getAuditLogs(): Promise<KaisaAdminAuditLog[]> {
        const supabase = await getSupabaseServer();
        const { data, error } = await supabase
            .from("audit_events")
            .select("*")
            .eq("actor_type", "admin")
            .order("created_at", { ascending: false });

        if (error || !data) {
            if (error) log.error("Error fetching audit logs", error);
            return [];
        }

        return data.map((logItem: any) => ({
            id: logItem.id,
            adminId: logItem.actor_id,
            actionType: logItem.metadata?.action_type || "config_change",
            scope: logItem.metadata?.scope || "global",
            targetUserId: logItem.entity_id,
            details: logItem.metadata?.details || "",
            timestamp: logItem.created_at
        }));
    }
};
