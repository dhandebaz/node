import crypto from 'crypto';

/**
 * Verify Razorpay Webhook Signature
 * @param body Raw request body as string
 * @param signature Razorpay signature from headers 'x-razorpay-signature'
 * @returns boolean indicating if signature is valid
 */
export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not defined");
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (e) {
    console.error("Error verifying Razorpay webhook signature:", e);
    return false;
  }
}

/**
 * Verify Twilio Webhook Signature
 * @param url Full requested URL including query params
 * @param params Parsed form data object
 * @param signature Twilio signature from headers 'x-twilio-signature'
 * @returns boolean indicating if signature is valid
 */
export function verifyTwilioWebhook(url: string, params: Record<string, any>, signature: string): boolean {
  try {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      console.warn("TWILIO_AUTH_TOKEN is not defined");
      return false;
    }

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    let data = url;
    for (const key of sortedKeys) {
      data += key + params[key];
    }

    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64');

    return expectedSignature === signature;
  } catch (e) {
    console.error("Error verifying Twilio webhook signature:", e);
    return false;
  }
}

/**
 * Generic HMAC Signature Verification
 * @param body Raw request body
 * @param signature Signature from headers
 * @param secret Secret key
 * @param algorithm Hash algorithm (default: sha256)
 * @returns boolean indicating if signature is valid
 */
export function verifyHmacSignature(
  body: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (e) {
    console.error(`Error verifying HMAC signature (${algorithm}):`, e);
    return false;
  }
}
