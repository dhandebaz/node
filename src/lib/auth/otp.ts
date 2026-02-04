// OTP Provider Abstraction
// Currently implements a mock provider for development

interface OTPProvider {
  sendOTP(phone: string, otp: string): Promise<boolean>;
}

class MockProvider implements OTPProvider {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    console.log(`[MOCK OTP] Sending ${otp} to ${phone}`);
    return true;
  }
}

// In future, add TwilioProvider, FirebaseProvider etc.
const provider: OTPProvider = new MockProvider();

// In-memory OTP store (Replace with Redis in production)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

export async function generateAndSendOTP(phone: string): Promise<boolean> {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store with 5 minute expiry
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
    attempts: 0
  });

  // In production, this would call the actual provider
  if (process.env.NODE_ENV === 'development') {
    // For Dev convenience: always log the fixed OTP for the super admin
    if (phone === "9999999999") {
       // We can force a specific OTP for testing if needed, or just log the random one
       console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    }
  }

  return await provider.sendOTP(phone, otp);
}

export async function verifyOTP(phone: string, inputOtp: string): Promise<{ valid: boolean; reason?: string }> {
  // DEV BACKDOOR: Always allow 123456 for the test user in development
  // This prevents "Invalid OTP" errors if the server restarts and clears the memory cache
  if (process.env.NODE_ENV === 'development' && phone === "9999999999" && inputOtp === "123456") {
    console.log(`[DEV MODE] Accepting Master OTP for ${phone}`);
    return { valid: true };
  }

  const record = otpStore.get(phone);

  if (!record) {
    console.log(`[OTP FAIL] No record found for ${phone}`);
    return { valid: false, reason: "expired" };
  }

  if (Date.now() > record.expires) {
    console.log(`[OTP FAIL] Record expired for ${phone}`);
    otpStore.delete(phone);
    return { valid: false, reason: "expired" };
  }

  if (record.attempts >= 3) {
    console.log(`[OTP FAIL] Too many attempts for ${phone}`);
    otpStore.delete(phone);
    return { valid: false, reason: "lockout" };
  }

  if (record.otp !== inputOtp) {
    console.log(`[OTP FAIL] Mismatch for ${phone}. Expected ${record.otp}, got ${inputOtp}`);
    record.attempts++;
    otpStore.set(phone, record);
    return { valid: false, reason: "invalid" };
  }

  // Success
  otpStore.delete(phone);
  return { valid: true };
}
