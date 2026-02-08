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
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let query = supabase
    .from('bookings')
    .select('*, guests(name), listings!inner(host_id)')
    .eq('listings.host_id', user.id);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  if (start) {
    query = query.gte('end_date', start);
  }

  if (end) {
    query = query.lte('start_date', end);
  }

  const { data: bookings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedBookings = bookings.map((b: any) => ({
    id: b.id,
    listingId: b.listing_id,
    guestId: b.guest_id,
    guestName: b.guests?.name || 'Unknown Guest',
    startDate: b.start_date,
    endDate: b.end_date,
    status: b.status,
    idStatus: b.id_status || 'not_requested',
    source: b.source,
  }));

  return NextResponse.json(formattedBookings);
}
