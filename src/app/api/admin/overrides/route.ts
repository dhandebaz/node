import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, id, reason } = body;

    if (!type || !id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    let result;

    if (type === 'booking_confirm') {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else if (type === 'kyc_approve') {
      // Assuming 'bookings' has id_status based on previous check, OR 'profiles' has kyc_status.
      // The user request was "Approve / reject ID manually".
      // Usually ID is tied to a booking (guest ID) or account (KYC).
      // If 'id' passed is a booking ID, update booking.
      // If 'id' is user ID, update profile.
      // Let's assume booking ID for guest ID verification as it's common in this domain.
      // Or checking 'bookings' table schema from api/bookings/[id]/route.ts: "id_status" exists.
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ id_status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else if (type === 'payment_mark_paid') {
      const { data, error } = await supabase
        .from('payments')
        .update({ status: 'completed', paid_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else if (type === 'wallet_reverse_debit') {
      // 1. Get the original transaction
      const { data: originalTx, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (txError || !originalTx) {
        throw new Error("Transaction not found");
      }

      if (originalTx.type !== 'debit') {
        throw new Error("Can only reverse debit transactions");
      }

      // 2. Create a reversal credit transaction
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          tenant_id: originalTx.tenant_id,
          host_id: originalTx.host_id,
          type: 'credit',
          amount: originalTx.amount,
          reason: `Reversal of ${id}: ${reason}`,
          status: 'completed',
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      return NextResponse.json({ error: "Invalid override type" }, { status: 400 });
    }

    await logEvent({
      actor_type: 'admin',
      actor_id: session.userId,
      event_type: EVENT_TYPES.ADMIN_MANUAL_OVERRIDE,
      entity_type: type,
      entity_id: id,
      metadata: { reason, result }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
