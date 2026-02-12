import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const searchParams = request.nextUrl.searchParams;
  const listingId = searchParams.get('listingId');
  const channel = searchParams.get('channel');

  let query = supabase
    .from('messages')
    .select('*, guests(name)')
    .eq('tenant_id', tenantId)
    .order('timestamp', { ascending: false });

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  if (channel) {
    query = query.eq('channel', channel);
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedMessages = messages.map((m: any) => {
    const guest = Array.isArray(m.guests) ? m.guests[0] : m.guests;
    return {
      id: m.id,
      guestId: m.guest_id,
      guestName: guest?.name || 'Unknown Guest',
      listingId: m.listing_id,
      channel: m.channel,
      direction: m.direction,
      content: m.content,
      timestamp: m.timestamp,
      read: m.is_read,
    };
  });

  return NextResponse.json(formattedMessages);
}
