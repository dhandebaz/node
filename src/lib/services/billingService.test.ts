import { describe, it, expect, vi, beforeEach } from "vitest";
import { billingService } from "./billingService";

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

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

function setupChain(data: unknown, error: unknown = null) {
  mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, data, error });
  mockEq.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle, single: mockSingle, order: mockOrder, data, error });
  mockOrder.mockReturnValue({ eq: mockEq, data, error });
  mockMaybeSingle.mockResolvedValue({ data, error });
  mockSingle.mockResolvedValue({ data, error });
}

describe("billingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlans", () => {
    it("should return all plans with correct mapping", async () => {
      const mockPlans = [
        {
          id: "plan_kaisa_manager",
          name: "Kaisa Manager",
          description: "For individual managers",
          price: 299,
          currency: "INR",
          interval: "month",
          product: "kaisa",
          features: ["Task Management", "Basic Modules"],
          type: "subscription",
          created_at: "2024-01-01",
        },
      ];
      setupChain(mockPlans);

      const result = await billingService.getPlans();

      expect(mockFrom).toHaveBeenCalledWith("billing_plans");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("plan_kaisa_manager");
      expect(result[0].price).toBe(299);
      expect(result[0].features).toEqual(["Task Management", "Basic Modules"]);
    });

    it("should filter by product when specified", async () => {
      setupChain([]);
      
      await billingService.getPlans("kaisa");

      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("product", "kaisa");
    });

    it("should return empty array on error", async () => {
      setupChain(null, { message: "DB error" });

      const result = await billingService.getPlans();

      expect(result).toEqual([]);
    });
  });

  describe("getUserSubscriptions", () => {
    it("should map DB subscription to app subscription correctly", async () => {
      const mockSub = {
        id: "sub-123",
        user_id: "user-456",
        plan_id: "plan_kaisa_manager",
        status: "active",
        current_period_start: "2024-01-01",
        current_period_end: "2024-02-01",
        cancel_at_period_end: false,
        metadata: null,
      };
      setupChain([mockSub]); // Returns array
      mockMaybeSingle.mockResolvedValue({ data: mockSub, error: null });

      const result = await billingService.getUserSubscriptions("user-456");

      expect(result.length).toBe(1);
      expect(result[0]?.userId).toBe("user-456");
      expect(result[0]?.status).toBe("active");
      expect(result[0]?.cancelAtPeriodEnd).toBe(false);
    });

    it("should return empty array when no subscription found", async () => {
      setupChain(null); // Returns null from query
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await billingService.getUserSubscriptions("nonexistent-user");

      expect(result).toEqual([]);
    });
  });

  describe("getUserInvoices", () => {
    it("should return mapped invoices ordered by date", async () => {
      const mockInvoices = [
        {
          id: "inv-1",
          user_id: "user-1",
          subscription_id: "sub-1",
          amount: 299,
          currency: "INR",
          status: "paid",
          date: "2024-01-15",
          items: [{ description: "Kaisa Manager", amount: 299 }],
          billing_details: { name: "Test User" },
          created_at: "2024-01-15",
        },
      ];
      setupChain(mockInvoices);

      const result = await billingService.getUserInvoices("user-1");

      expect(result.length).toBe(1);
      expect(result[0].amount).toBe(299);
      expect(result[0].status).toBe("paid");
    });
  });
});
