import { z } from "zod";

export const businessDetailsSchema = z.object({
  propertyCount: z.coerce
    .number()
    .min(1, "Value must be at least 1")
    .max(10000, "Value seems too high. Please contact support for enterprise."),
  platforms: z
    .array(z.string())
    .min(1, "Please select at least one platform."),
});

export type BusinessDetails = z.infer<typeof businessDetailsSchema>;
