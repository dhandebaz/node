import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing

  const body = await request.json();

  return NextResponse.json({
    id: `msg-${Date.now()}`,
    guestId: 'guest-1',
    listingId: 'listing-1',
    channel: 'airbnb',
    direction: 'outbound',
    content: 'Here is an AI generated reply to your request.',
    timestamp: new Date().toISOString(),
  });
}
