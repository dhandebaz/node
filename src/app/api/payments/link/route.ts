import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return NextResponse.json({
    link: 'https://payment.nodebase.com/pay/123456',
  });
}
