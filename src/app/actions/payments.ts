
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
