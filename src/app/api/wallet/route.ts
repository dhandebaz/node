import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    balance: 500,
  });
}
