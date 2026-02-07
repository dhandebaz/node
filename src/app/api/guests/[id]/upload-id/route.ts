import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    id: id,
    name: 'Verified Guest',
    phone: '+1234567890',
    channel: 'airbnb',
    idVerificationStatus: 'verified',
  });
}
