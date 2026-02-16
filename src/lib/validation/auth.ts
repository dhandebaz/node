import { z } from 'zod';

export const phoneSchema = z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (E.164)");

export const emailSchema = z.string().email("Invalid email address").optional();

export const otpSchema = z.string().length(6, "OTP must be 6 digits");

export const userLoginSchema = z.object({
    idToken: z.string().min(1, "ID Token is required"),
    preferredProduct: z.string().optional(),
});

export const userCreateSchema = z.object({
    phone: phoneSchema,
    email: emailSchema,
    role: z.enum(['customer', 'investor', 'admin', 'superadmin']).default('customer'),
    metadata: z.record(z.string(), z.any()).optional(),
});
