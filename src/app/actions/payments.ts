
'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { PaymentLinkService } from "@/lib/services/paymentLinkService";
import { revalidatePath } from "next/cache";

export async function createBookingLinkAction(params: {
  conversationId: string;
  listingId?: string;
  amount: number;
  metadata?: any;
}) {
  const tenantId = await requireActiveTenant();
  
  const result = await PaymentLinkService.createLink({
    tenantId,
    ...params
  });

  revalidatePath(`/dashboard/ai/inbox`);
  return { 
    success: true, 
    checkoutUrl: result.checkoutUrl,
    expiresAt: result.expires_at
  };
}

export async function updateHostUPIAction(upiId: string, payeeName: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await (await import('@/lib/supabase/server')).getSupabaseServer();

  const { error } = await supabase
    .from('tenants')
    .update({ 
      upi_id: upiId,
      name: payeeName // Using 'name' as payee name for now
    })
    .eq('id', tenantId);

  if (error) {
    console.error("Failed to update UPI settings", error);
    throw new Error("Failed to update UPI settings");
  }

  revalidatePath('/dashboard/billing');
  return { success: true };
}
