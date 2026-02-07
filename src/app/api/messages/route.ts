import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 700));

  return NextResponse.json([
    {
      id: 'msg-1',
      guestId: 'guest-1',
      guestName: 'Rahul Sharma',
      listingId: 'listing-1',
      channel: 'airbnb',
      direction: 'inbound',
      content: 'Is early check-in available?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'msg-2',
      guestId: 'guest-1',
      guestName: 'Rahul Sharma',
      listingId: 'listing-1',
      channel: 'airbnb',
      direction: 'outbound',
      content: 'Yes, you can check in at 1 PM.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
  ]);
}
