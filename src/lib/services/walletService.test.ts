import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletService } from "./walletService";
import { AppError, ErrorCode } from "@/lib/errors";

// Mock Supabase client and its chainable methods
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockRpc = vi.fn();

const mockFrom = vi.fn((table?: string) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
      rpc: mockRpc,
    }),
  ),
  getSupabaseAdmin: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
      rpc: mockRpc,
    }),
  ),
}));

// Mock logger to prevent spam during tests
vi.mock("@/lib/logger", () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("WalletService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBalance", () => {
    it("should return balance as a number when record exists", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { balance: 150.5 },
        error: null,
      });

      const balance = await WalletService.getBalance("tenant-123");

      expect(balance).toBe(150.5);
      expect(mockFrom).toHaveBeenCalledWith("wallets");
    });

    it("should return 0 and not throw when record is missing (PGRST116)", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      const balance = await WalletService.getBalance("tenant-123");

      expect(balance).toBe(0);
    });

    it("should return 0 when other database error occurs", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "OTHER", message: "DB Error" },
      });

      const balance = await WalletService.getBalance("tenant-123");

      expect(balance).toBe(0);
    });
  });

  describe("deductCredits", () => {
    it("should call record_ai_usage_v1 RPC with correct parameters", async () => {
      mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

      const result = await WalletService.deductCredits(
        "tenant-123",
        10,
        "ai_reply",
        { model: "gemini-1.5" },
      );

      expect(result).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith(
        "record_ai_usage_v1",
        expect.objectContaining({
          p_tenant_id: "tenant-123",
          p_amount: -10, // Deduction should be negative
          p_action_type: "ai_reply",
        }),
      );
    });

    it("should throw AppError with BAD_REQUEST when insufficient funds (error code 23514)", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: {
          code: "23514",
          message: 'new row for relation "wallets" violates check constraint',
        },
      });

      await expect(
        WalletService.deductCredits("tenant-123", 100, "ai_reply"),
      ).rejects.toMatchObject({
        code: ErrorCode.BAD_REQUEST,
        message: expect.stringContaining("Insufficient wallet balance"),
      });
    });

    it("should throw AppError with INTERNAL_ERROR on other RPC failures", async () => {
      mockRpc.mockResolvedValue({
        data: { success: false, error: "System crash" },
        error: null,
      });

      await expect(
        WalletService.deductCredits("tenant-123", 10, "ai_reply"),
      ).rejects.toMatchObject({
        code: ErrorCode.INTERNAL_ERROR,
      });
    });
  });

  describe("hasSufficientBalance", () => {
    it("should return true when balance is greater than or equal to cost", async () => {
      mockSingle.mockResolvedValueOnce({ data: { balance: 50 }, error: null });

      const hasFunds = await WalletService.hasSufficientBalance(
        "tenant-123",
        40,
      );

      expect(hasFunds).toBe(true);
    });

    it("should return false when balance is less than cost", async () => {
      mockSingle.mockResolvedValueOnce({ data: { balance: 30 }, error: null });

      const hasFunds = await WalletService.hasSufficientBalance(
        "tenant-123",
        40,
      );

      expect(hasFunds).toBe(false);
    });
  });
});
