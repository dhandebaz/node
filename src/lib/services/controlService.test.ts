import { describe, it, expect, vi, beforeEach } from "vitest";
import { ControlService } from "./controlService";

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
  getSupabaseAdmin: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

describe("ControlService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSystemFlags", () => {
    it("should return fetched flags from database", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ key: "ai_global_enabled", value: true }],
        error: null
      });

      const flags = await ControlService.getSystemFlags();
      expect(flags["ai_global_enabled"]).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("system_flags");
    });

    it("should return fallback defaults on error", async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: new Error("DB Error")
      });

      const flags = await ControlService.getSystemFlags();
      expect(flags).toEqual({}); // Returns empty object on error
    });
  });
});
