import {
  OmniGlobalConfig,
  OmniAdminAuditLog,
  OmniStats,
  OmniBusinessType,
} from "@/types/omni";
import { getSupabaseServer } from "@/lib/supabase/server";
import { userService } from "@/lib/services/userService";
import { log } from "@/lib/logger";

export const omniAdminService = {
    async getStats(): Promise<OmniStats> {
        const users = await userService.getUsers();
        // Filter users who have Omni product
        const omniUsers = users.filter(u => u.roles.isOmniUser && u.products.omni);

        // Initialize stats
        const stats: OmniStats = {
            totalUsers: omniUsers.length,
            activeUsers: omniUsers.filter(u => u.status.account === "active").length,
            pausedUsers: omniUsers.filter(u => u.status.account === "suspended").length,
            byType: { Doctor: 0, Homestay: 0, Retail: 0, Other: 0 },
            byRole: { owner: 0, manager: 0, "co-founder": 0 },
        };

        // Aggregate stats
        omniUsers.forEach(u => {
            const omniProduct = u.products.omni;
            if (omniProduct?.businessType) {
                const type = omniProduct.businessType as OmniBusinessType;
                // Validate type is a known key, else "Other"
                if (Object.prototype.hasOwnProperty.call(stats.byType, type)) {
                    stats.byType[type]++;
                } else {
                    stats.byType.Other++;
                }
            }
            if (omniProduct?.role) {
                // Ensure role exists in stats, though TypeScript might complain if types drift
                if (Object.prototype.hasOwnProperty.call(stats.byRole, omniProduct.role)) {
                    stats.byRole[omniProduct.role]++;
                }
            }
        });

        return stats;
    },

    async getAuditLogs(): Promise<OmniAdminAuditLog[]> {
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
