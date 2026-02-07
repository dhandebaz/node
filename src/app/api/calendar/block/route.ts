import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    id: `booking-${Date.now()}`,
    listingId: body.listingId,
    guestId: 'manual-block',
    startDate: body.dates.start,
    endDate: body.dates.end,
    status: 'blocked',
    source: 'nodebase',
  });
}
