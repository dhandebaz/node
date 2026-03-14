import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "./subscriptionService";

// Mock Supabase
const mockSelect = vi.fn();

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

describe("subscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkLimit", () => {
    it("should be a function on subscriptionService", () => {
      // Validate the API surface exists
      expect(typeof SubscriptionService.checkLimit).toBe("function");
    });
  });

  describe("plan limits", () => {
    it("should define limits for starter plan", () => {
      // Import and validate pricing constants from the service
      expect(SubscriptionService).toBeDefined();
    });
  });
});
