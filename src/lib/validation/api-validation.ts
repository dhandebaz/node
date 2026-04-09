/**
 * Centralized Zod validation schemas for all API inputs.
 * Used in API routes and server actions for input sanitization.
 */
import { z } from "zod";

// ==========================================
// Auth
// ==========================================

export const loginSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

export const signupSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  businessType: z.enum(["service_business", "airbnb_host", "kirana_store", "doctor_clinic", "thrift_store"]).optional(),
});

// ==========================================
// Bookings
// ==========================================

export const createBookingSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  guestName: z.string().min(1, "Guest name required").max(200),
  guestContact: z.string().optional(),
  checkIn: z.string().datetime({ message: "Invalid check-in date" }),
  checkOut: z.string().datetime({ message: "Invalid check-out date" }),
  amount: z.number().min(0, "Amount must be non-negative"),
  source: z.enum(["nodebase", "airbnb", "booking", "mmt", "direct"]).default("direct"),
});

export const updateBookingSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "refunded", "blocked", "pending"]).optional(),
  amount: z.number().min(0).optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
});

// ==========================================
// Listings
// ==========================================

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(5000).optional(),
  location: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  listingType: z.enum(["Apartment", "Villa", "Homestay", "Guest House"]).default("Homestay"),
  timezone: z.string().default("Asia/Kolkata"),
  basePrice: z.number().min(0, "Price must be non-negative").default(0),
  maxGuests: z.number().int().min(1).max(100).default(1),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  rules: z.string().max(2000).optional(),
});

// ==========================================
// Billing
// ==========================================

export const topUpSchema = z.object({
  amount: z.number().min(100, "Minimum top-up is ₹100").max(100000, "Maximum top-up is ₹1,00,000"),
  currency: z.string().default("INR"),
});

export const subscribeSchema = z.object({
  planId: z.string().min(1, "Plan ID required"),
});

// ==========================================
// Support
// ==========================================

export const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  product: z.enum(["ai_employee", "general"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// ==========================================
// Chat / Messages
// ==========================================

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1, "Message cannot be empty").max(10000),
  guestId: z.string().uuid().optional(),
});

// ==========================================
// Settings
// ==========================================

export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});

// ==========================================
// Admin
// ==========================================

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["user", "admin", "superadmin", "manager"]),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  status: z.enum(["active", "suspended", "banned"]),
});

export const toggleFeatureFlagSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
  tenantOverrides: z.array(z.string().uuid()).optional(),
});

export const toggleSystemFlagSchema = z.object({
  key: z.string().min(1),
  value: z.boolean(),
});

// ==========================================
// Utility: Parse and throw
// ==========================================

/**
 * Parse input with a Zod schema. Throws a structured error on failure.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(`Validation Error: ${firstError?.path.join(".")}  -  ${firstError?.message}`);
  }
  return result.data;
}

/**
 * Parse input with a Zod schema. Returns { data, error } instead of throwing.
 */
export function parseInput<T>(
  schema: z.ZodType<T>,
  data: unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      data: null,
      error: `${firstError?.path.join(".")}  -  ${firstError?.message}`,
    };
  }
  return { data: result.data, error: null };
}
