import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return NextResponse.json([
    {
      id: 'tx-1',
      hostId: 'host-123',
      type: 'debit',
      amount: 50,
      reason: 'AI Agent Usage',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'tx-2',
      hostId: 'host-123',
      type: 'credit',
      amount: 1000,
      reason: 'Wallet Top-up',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
}
