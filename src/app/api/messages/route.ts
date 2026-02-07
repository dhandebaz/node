import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const listingId = searchParams.get('listingId');
  const channel = searchParams.get('channel');

  let query = supabase
    .from('messages')
    .select('*, guests(name), listings!inner(host_id)')
    .eq('listings.host_id', user.id)
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

  const formattedMessages = messages.map((m: any) => ({
    id: m.id,
    guestId: m.guest_id,
    guestName: m.guests?.name || 'Unknown Guest',
    listingId: m.listing_id,
    channel: m.channel,
    direction: m.direction,
    content: m.content,
    timestamp: m.timestamp,
    read: m.is_read,
  }));

  return NextResponse.json(formattedMessages);
}
