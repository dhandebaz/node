import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json([
    {
      id: 'listing-1',
      hostId: 'host-123',
      title: 'Cozy Mountain Cabin',
      location: 'Manali, India',
      maxGuests: 4,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      rules: ['No smoking', 'No pets'],
      basePrice: 3500,
    },
    {
      id: 'listing-2',
      hostId: 'host-123',
      title: 'Seaside Apartment',
      location: 'Goa, India',
      maxGuests: 2,
      checkInTime: '15:00',
      checkOutTime: '10:00',
      rules: ['No parties'],
      basePrice: 5000,
    },
  ]);
}
