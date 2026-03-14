import crypto from 'crypto';

/**
 * Verify Razorpay webhook signature.
 * Uses HMAC SHA256 to validate that the request body was signed by Razorpay.
 *
 * @param body - Raw request body string
 * @param signature - Value of `x-razorpay-signature` header
 * @param secret - Razorpay webhook secret (from env)
 * @returns true if signature is valid
 */
export function verifyRazorpayWebhook(
  body: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[WebhookVerify] RAZORPAY_WEBHOOK_SECRET is not configured');
    return false;
  }

  if (!signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Verify a generic HMAC-based webhook signature.
 * Useful for WhatsApp (WAHA), custom integrations, etc.
 */
export function verifyHmacSignature(
  body: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  if (!secret || !signature) return false;

  try {
    const expected = crypto
      .createHmac(algorithm, secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
