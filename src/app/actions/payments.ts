
'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { PaymentLinkService } from "@/lib/services/paymentLinkService";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

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

interface UPIUpdateParams {
  upiId?: string;
  payeeName?: string;
  upiMobile?: string;
  businessQrUrl?: string;
}

export async function updateHostUPIAction(params: UPIUpdateParams) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  const updateData: Record<string, any> = {};
  
  if (params.upiId !== undefined) {
    updateData.upi_id = params.upiId;
  }
  if (params.payeeName !== undefined) {
    updateData.name = params.payeeName;
  }
  if (params.upiMobile !== undefined) {
    updateData.upi_mobile = params.upiMobile;
  }
  if (params.businessQrUrl !== undefined) {
    updateData.business_qr_url = params.businessQrUrl;
  }

  const { error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', tenantId);

  if (error) {
    console.error("Failed to update UPI settings", error);
    throw new Error("Failed to update UPI settings");
  }

  revalidatePath('/dashboard/billing');
  return { success: true };
}

export async function uploadQRCodeAction(base64Data: string): Promise<string> {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
  // Generate unique filename
  const fileName = `qrcodes/${tenantId}_${Date.now()}.png`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('business-assets')
    .upload(fileName, Buffer.from(base64, 'base64'), {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error("Failed to upload QR code:", error);
    throw new Error("Failed to upload QR code");
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('business-assets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
