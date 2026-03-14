import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleSystemFlagAction } from './admin';
import { ControlService } from '@/lib/services/controlService';
import { getSupabaseServer } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('@/lib/services/controlService', () => ({
  ControlService: {
    toggleSystemFlag: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleSystemFlagAction', () => {
    it('should throw an error if not authenticated', async () => {
      (getSupabaseServer as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      });

      await expect(toggleSystemFlagAction('ai_global_enabled' as any, true)).rejects.toThrow('Unauthorized');
    });

    it('should call control service and revalidate if authenticated', async () => {
      (getSupabaseServer as any).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      });

      await toggleSystemFlagAction('ai_global_enabled' as any, true);
      expect(ControlService.toggleSystemFlag).toHaveBeenCalledWith('ai_global_enabled', true, 'admin-1');
      const { revalidatePath } = await import('next/cache');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/launch');
    });
  });
});
