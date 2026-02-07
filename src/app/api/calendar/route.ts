import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');

  await new Promise((resolve) => setTimeout(resolve, 600));

  // Return different bookings based on listingId if needed, or generic mocks
  return NextResponse.json([
    {
      id: 'booking-1',
      listingId: listingId || 'listing-1',
      guestId: 'guest-1',
      startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      status: 'confirmed',
      source: 'airbnb',
    },
    {
      id: 'booking-2',
      listingId: listingId || 'listing-1',
      guestId: 'guest-2',
      startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
      status: 'pending',
      source: 'nodebase',
    },
  ]);
}
