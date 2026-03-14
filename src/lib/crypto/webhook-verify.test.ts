import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyRazorpayWebhook, verifyHmacSignature } from "./webhook-verify";

describe("verifyRazorpayWebhook", () => {
  const testBody = '{"event":"payment.captured","payload":{}}';
  const testSecret = "rzp_webhook_test_secret_12345";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true for valid signature", () => {
    const expectedSig = crypto
      .createHmac("sha256", testSecret)
      .update(testBody)
      .digest("hex");

    const result = verifyRazorpayWebhook(testBody, expectedSig, testSecret);
    expect(result).toBe(true);
  });

  it("should return false for invalid signature", () => {
    const result = verifyRazorpayWebhook(testBody, "invalid_signature_hash", testSecret);
    expect(result).toBe(false);
  });

  it("should return false when secret is not provided and env is empty", () => {
    const originalEnv = process.env.RAZORPAY_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;

    const result = verifyRazorpayWebhook(testBody, "some_sig");
    expect(result).toBe(false);

    if (originalEnv) process.env.RAZORPAY_WEBHOOK_SECRET = originalEnv;
  });

  it("should return false for empty signature", () => {
    const result = verifyRazorpayWebhook(testBody, "", testSecret);
    expect(result).toBe(false);
  });

  it("should use env variable when secret param is not provided", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const expectedSig = crypto
      .createHmac("sha256", testSecret)
      .update(testBody)
      .digest("hex");

    const result = verifyRazorpayWebhook(testBody, expectedSig);
    expect(result).toBe(true);

    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });
});

describe("verifyHmacSignature", () => {
  const body = "test-body-content";
  const secret = "test-secret";

  it("should verify SHA256 HMAC signature", () => {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    expect(verifyHmacSignature(body, signature, secret, "sha256")).toBe(true);
  });

  it("should verify SHA1 HMAC signature", () => {
    const signature = crypto
      .createHmac("sha1", secret)
      .update(body)
      .digest("hex");

    expect(verifyHmacSignature(body, signature, secret, "sha1")).toBe(true);
  });

  it("should reject incorrect signatures", () => {
    expect(verifyHmacSignature(body, "wrong", secret)).toBe(false);
  });

  it("should reject empty secret", () => {
    expect(verifyHmacSignature(body, "sig", "")).toBe(false);
  });

  it("should reject empty signature", () => {
    expect(verifyHmacSignature(body, "", secret)).toBe(false);
  });
});
