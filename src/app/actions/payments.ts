"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { revalidatePath } from "next/cache";

/**
 * Updates the host's UPI settings for direct payouts.
 * 
 * @param upiId - The UPI ID (e.g., "user@upi")
 * @param payeeName - The name associated with the UPI ID
 */
export async function updateHostUPIAction(upiId: string, payeeName: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // Validate inputs
  if (!upiId || !payeeName) {
    throw new Error("UPI ID and Payee Name are required.");
  }

  // Basic UPI ID format validation
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  if (!upiRegex.test(upiId)) {
    throw new Error("Invalid UPI ID format.");
  }

  // Update or insert the UPI settings into the tenant's payment configuration
  // Assuming a 'payment_settings' table or storing in 'tenants' table jsonb field
  // For this implementation, we'll assume a 'tenant_settings' table or similar structure
  // Let's use a standard pattern for settings
  
  const { error } = await supabase
    .from("tenants")
    .update({
      payment_config: {
        upi_id: upiId,
        payee_name: payeeName,
        updated_at: new Date().toISOString()
      }
    })
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating UPI settings:", error);
    throw new Error("Failed to update UPI settings.");
  }

  revalidatePath("/dashboard/billing");
  return { success: true };
}
