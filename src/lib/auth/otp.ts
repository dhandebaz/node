// OTP Provider Abstraction
// Currently implements a mock provider for development

import { settingsService } from "../services/settingsService";

interface OTPProvider {
  sendOTP(phone: string, otp: string): Promise<boolean>;
}

class MockProvider implements OTPProvider {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    console.log(`[MOCK OTP] Sending ${otp} to ${phone}`);
    return true;
  }
}

class FirebaseProvider implements OTPProvider {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const settings = await settingsService.getSettings();
    const fbConfig = settings.integrations.find(i => i.id === "int_firebase");
    
    if (fbConfig && fbConfig.status === "connected") {
         console.log(`[FIREBASE] Simulating OTP send for project: ${fbConfig.projectId || "unknown"}`);
         // In real implementation: verify client-side or use Admin SDK
         return true;
    } 
    
    console.log(`[FIREBASE] Integration not ready or failed.`);
    return false;
  }
}

class TwilioProvider implements OTPProvider {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const settings = await settingsService.getSettings();
    const config = settings.integrations.find(i => i.id === "int_twilio");

    if (!config || config.status !== "connected" || !config.accountSid || !config.authToken || !config.fromPhoneNumber) {
      console.log(`[TWILIO] Integration not configured.`);
      return false;
    }

    console.log(`[TWILIO] Sending OTP via Twilio API...`);
    
    try {
      // Basic Auth header
      const auth = btoa(`${config.accountSid}:${config.authToken}`);
      const body = new URLSearchParams({
        To: phone,
        From: config.fromPhoneNumber,
        Body: `Your verification code is: ${otp}`
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`[TWILIO] API Error: ${err}`);
        return false;
      }

      const data = await response.json();
      console.log(`[TWILIO] Message sent! SID: ${data.sid}`);
      return true;

    } catch (error) {
      console.error(`[TWILIO] Network/Client Error:`, error);
      return false;
    }
  }
}

const mockProvider = new MockProvider();
const firebaseProvider = new FirebaseProvider();
const twilioProvider = new TwilioProvider();

// In-memory OTP store (Replace with Redis in production)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

export async function generateAndSendOTP(phone: string): Promise<boolean> {
  const isProduction = await settingsService.isProductionMode();
  
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store with 5 minute expiry
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
    attempts: 0
  });

  if (isProduction) {
    // 1. Try Firebase Primary
    const fbSuccess = await firebaseProvider.sendOTP(phone, otp);
    if (fbSuccess) return true;

    // 2. Fallback to Twilio
    console.warn(`[OTP] Primary provider failed. Attempting fallback to Twilio...`);
    const twilioSuccess = await twilioProvider.sendOTP(phone, otp);
    return twilioSuccess;
  } else {
    // In Mock/Dev, use mock provider and log OTP
    if (phone === "9910778576") {
       console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    }
    return await mockProvider.sendOTP(phone, otp);
  }
}

export async function verifyOTP(phone: string, inputOtp: string): Promise<{ valid: boolean; reason?: string }> {
  const isProduction = await settingsService.isProductionMode();

  // DEV BACKDOOR: Only in Mock Mode
  if (!isProduction && phone === "9910778576" && inputOtp === "223344") {
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
