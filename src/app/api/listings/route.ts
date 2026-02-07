import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await getSupabaseServer();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('host_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedListings = listings.map((l: any) => ({
    id: l.id,
    hostId: l.host_id,
    title: l.title,
    location: l.location,
    maxGuests: l.max_guests,
    checkInTime: l.check_in_time,
    checkOutTime: l.check_out_time,
    rules: l.rules,
    basePrice: l.base_price,
    calendarIcalUrl: l.calendar_ical_url,
  }));

  return NextResponse.json(formattedListings);
}
