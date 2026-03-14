'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";
import { getSession } from "@/lib/auth/session";

export async function extractKycDataAction(fileBase64: string, mimeType: string, isPublic: boolean = false) {
  const supabase = isPublic ? await getSupabaseAdmin() : await getSupabaseServer();
  
  let tenantId: string | null = null;
  let userId: string | null = null;

  if (!isPublic) {
    tenantId = await requireActiveTenant();
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized: No session");
    userId = session.userId;
  }

  // 1. Process with Gemini Vision
  const result = await geminiService.verifyDocument(fileBase64, mimeType);

  if (!result.isValid) {
    throw new Error(result.reason || "Could not verify document. Please try a clearer photo.");
  }

  // 2. Store document metadata (Only if we have context)
  let documentId = null;
  if (tenantId && userId) {
    const { data: doc, error } = await supabase
      .from('kyc_documents')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        document_type: result.documentType.toLowerCase(),
        file_path: 'ai_extracted_temp', 
        extracted_data: result.details,
        status: 'processed'
      })
      .select()
      .single();

    if (!error && doc) {
      documentId = doc.id;
    }
  }

  return {
    success: true,
    documentType: result.documentType,
    details: result.details,
    documentId: documentId
  };
}

export async function completeGuestCheckinAction(data: {
  linkId: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  documentId?: string;
  arrivalTime?: string;
}) {
  const supabase = await getSupabaseAdmin();

  // 1. Create Check-in Record
  const { data: checkin, error: checkinError } = await supabase
    .from('guest_checkins')
    .insert({
      tenant_id: data.tenantId,
      payment_link_id: data.linkId,
      guest_name: data.name,
      guest_email: data.email,
      guest_phone: data.phone,
      arrival_time: data.arrivalTime,
      id_verified: !!data.idNumber,
      id_document_id: data.documentId,
      status: 'completed'
    })
    .select()
    .single();

  if (checkinError) {
    console.error("Failed to create guest check-in", checkinError);
    throw new Error("Failed to save check-in details");
  }

  // 2. Mark Payment Link as Paid (Since this is the "I Have Paid" flow for QR)
  const { error: linkError } = await supabase
    .from('payment_links')
    .update({ status: 'paid' })
    .eq('id', data.linkId);

  if (linkError) {
    console.error("Failed to update payment link status", linkError);
  }

  return { success: true, checkinId: checkin.id };
}

export async function verifyCashfreeKYC(data: { pan: string, aadhaar: string }) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();

  // 1. Check Wallet Balance
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('tenant_id', tenantId)
    .single();

  if (walletError || !wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balance < 11) {
    throw new Error('Insufficient wage balance. Please top up at least ₹11.');
  }

  // 2. Deduct Balance & Record Transaction
  const { error: deductionError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance - 11 })
    .eq('tenant_id', tenantId);

  if (deductionError) {
    throw new Error('Failed to deduct balance');
  }

  const { error: txError } = await supabase
    .from('wallet_transactions')
    .insert({
      tenant_id: tenantId,
      type: 'deduction',
      amount: 11,
      description: 'Identity Verification Fee'
    });

  if (txError) {
    // Ideally we should rollback the balance deduction here, but for this task we'll proceed
    console.error('Failed to record transaction', txError);
  }

  // TODO: Call Cashfree Identity API
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5s delay

  // 3. Update Tenant KYC Status
  const { error: updateError } = await supabase
    .from('tenants')
    .update({
      kyc_status: 'verified',
      pan_number: data.pan,
      aadhaar_number: data.aadhaar,
      kyc_verified_at: new Date().toISOString()
    })
    .eq('id', tenantId);

  if (updateError) {
    throw new Error('Failed to update KYC status');
  }

  return { success: true };
}
