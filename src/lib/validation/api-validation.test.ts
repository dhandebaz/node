import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  createBookingSchema,
  createListingSchema,
  topUpSchema,
  createTicketSchema,
  parseOrThrow,
  parseInput,
} from "./api-validation";

describe("API Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should accept valid phone", () => {
      expect(loginSchema.safeParse({ phone: "+919876543210" }).success).toBe(true);
    });

    it("should reject invalid phone", () => {
      expect(loginSchema.safeParse({ phone: "abc" }).success).toBe(false);
    });

    it("should accept phone with OTP", () => {
      const result = loginSchema.safeParse({ phone: "+919876543210", otp: "123456" });
      expect(result.success).toBe(true);
    });

    it("should reject OTP of wrong length", () => {
      expect(loginSchema.safeParse({ phone: "+919876543210", otp: "12345" }).success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("should accept valid signup data", () => {
      const result = signupSchema.safeParse({
        phone: "+919876543210",
        fullName: "John Doe",
        businessType: "airbnb_host",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name too short", () => {
      expect(signupSchema.safeParse({ phone: "+919876543210", fullName: "J" }).success).toBe(false);
    });

    it("should reject invalid business type", () => {
      expect(signupSchema.safeParse({ phone: "+919876543210", fullName: "John", businessType: "invalid" }).success).toBe(false);
    });
  });

  describe("createBookingSchema", () => {
    it("should accept valid booking", () => {
      const result = createBookingSchema.safeParse({
        listingId: "550e8400-e29b-41d4-a716-446655440000",
        guestName: "Jane",
        checkIn: "2024-06-01T10:00:00Z",
        checkOut: "2024-06-05T10:00:00Z",
        amount: 5000,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative amount", () => {
      const result = createBookingSchema.safeParse({
        listingId: "550e8400-e29b-41d4-a716-446655440000",
        guestName: "Jane",
        checkIn: "2024-06-01T10:00:00Z",
        checkOut: "2024-06-05T10:00:00Z",
        amount: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("topUpSchema", () => {
    it("should accept valid amount", () => {
      expect(topUpSchema.safeParse({ amount: 500 }).success).toBe(true);
    });

    it("should reject amount below minimum", () => {
      expect(topUpSchema.safeParse({ amount: 50 }).success).toBe(false);
    });

    it("should reject amount above maximum", () => {
      expect(topUpSchema.safeParse({ amount: 200000 }).success).toBe(false);
    });
  });

  describe("createTicketSchema", () => {
    it("should accept valid ticket", () => {
      const result = createTicketSchema.safeParse({
        subject: "Payment issue with booking",
        product: "ai_employee",
        message: "I'm having trouble with my latest payment",
      });
      expect(result.success).toBe(true);
    });

    it("should reject subject too short", () => {
      const result = createTicketSchema.safeParse({
        subject: "Hi",
        product: "general",
        message: "Need help with something important",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("parseOrThrow", () => {
    it("should return parsed data for valid input", () => {
      const result = parseOrThrow(topUpSchema, { amount: 1000 });
      expect(result.amount).toBe(1000);
    });

    it("should throw for invalid input", () => {
      expect(() => parseOrThrow(topUpSchema, { amount: -1 })).toThrow("Validation Error");
    });
  });

  describe("parseInput", () => {
    it("should return data and null error for valid input", () => {
      const result = parseInput(topUpSchema, { amount: 500 });
      expect(result.data).not.toBeNull();
      expect(result.error).toBeNull();
    });

    it("should return null data and error message for invalid input", () => {
      const result = parseInput(topUpSchema, { amount: 10 });
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });
});
