import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/crypto/webhook-verify', () => ({
  verifyRazorpayWebhook: vi.fn().mockReturnValue(false),
}));
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdmin: vi.fn(),
}));

describe('Razorpay Webhook POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
  });

  it('should return 401 if signature is invalid', async () => {
    const req = new Request('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      body: JSON.stringify({ event: 'payment.captured' }),
      headers: {
        'x-razorpay-signature': 'invalid-sig'
      }
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
  });
});
