import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    id: 'host-123',
    name: 'Airbnb Host',
    email: 'host@example.com',
    address: '123 Hosting Lane',
    kycStatus: 'verified',
    walletBalance: 500,
  });
}
