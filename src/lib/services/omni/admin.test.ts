import { describe, it, expect, vi, beforeEach } from 'vitest';
import { omniAdminService } from './admin';
import { userService } from '@/lib/services/userService';
import { User } from '@/types/user';

// Mock dependencies
vi.mock('@/lib/services/userService', () => ({
    userService: {
        getUsers: vi.fn(),
    },
}));

vi.mock('@/lib/supabase/server', () => ({
    getSupabaseServer: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    log: { error: vi.fn() },
}));

describe('omniAdminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getStats', () => {
        it('should correctly aggregate user stats', async () => {
            // Mock Users
            const mockUsers: Partial<User>[] = [
                // User 1: Active Owner, Retail
                {
                    status: { account: 'active' } as any,
                    roles: { isOmniUser: true } as any,
                    products: {
                        omni: {
                            businessType: 'Retail',
                            role: 'owner',
                        } as any
                    } as any
                },
                // User 2: Suspended Manager, Doctor
                {
                    status: { account: 'suspended' } as any,
                    roles: { isOmniUser: true } as any,
                    products: {
                        omni: {
                            businessType: 'Doctor',
                            role: 'manager',
                        } as any
                    } as any
                },
                // User 3: Non-Omni User
                {
                    roles: { isOmniUser: false } as any,
                    products: {} as any
                }
            ];

            (userService.getUsers as any).mockResolvedValue(mockUsers);

            const stats = await omniAdminService.getStats();

            expect(stats.totalUsers).toBe(2);
            expect(stats.activeUsers).toBe(1);
            expect(stats.pausedUsers).toBe(1);

            expect(stats.byType.Retail).toBe(1);
            expect(stats.byType.Doctor).toBe(1);

            expect(stats.byRole.owner).toBe(1);
            expect(stats.byRole.manager).toBe(1);
        });

        it('should return zero stats if no users found', async () => {
            (userService.getUsers as any).mockResolvedValue([]);

            const stats = await omniAdminService.getStats();

            expect(stats.totalUsers).toBe(0);
            expect(stats.activeUsers).toBe(0);
        });
    });
});
