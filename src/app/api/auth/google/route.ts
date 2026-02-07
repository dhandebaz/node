import { NextResponse } from 'next/server';

export async function POST() {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    token: 'mock-jwt-token',
    host: {
      id: 'host-123',
      name: 'Airbnb Host',
      email: 'host@example.com',
      address: '123 Hosting Lane',
      kycStatus: 'verified',
      walletBalance: 500,
    },
  });
}
