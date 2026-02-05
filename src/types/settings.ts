
export type OTPProvider = "Twilio" | "Firebase" | "Custom";
export type EnvironmentMode = "production" | "staging" | "maintenance" | "readonly";

export interface AuthSettings {
  otpProvider: OTPProvider;
  otpExpirySeconds: number;
  otpRetryLimit: number;
  adminLoginEnabled: boolean;
  rateLimitWindowSeconds: number;
  rateLimitMaxRequests: number;
  firebaseConfig?: string; // For OTP integration
  firebaseEnabled?: boolean;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string; // Masked in UI
  webhookUrl?: string;
  status: "connected" | "disconnected" | "error";
  lastChecked?: string;
  // Extended configuration fields
  clientId?: string;     // PayPal, etc.
  clientSecret?: string; // PayPal, Razorpay
  vendorId?: string;     // Paddle
  publicKey?: string;    // Paddle (Client-side token)
  // Firebase specific fields
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  // Twilio specific fields
  accountSid?: string;
  authToken?: string;
  fromPhoneNumber?: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  restrictedToRoles?: string[];
  restrictedToProducts?: string[]; // "kaisa", "space", "node"
}

export interface PlatformSettings {
  environment: "mock" | "production";
  maintenanceMode: boolean;
  readOnlyMode: boolean;
  signupEnabled: {
    kaisa: boolean;
    space: boolean;
    node: boolean;
  };
}

export interface NotificationSettings {
  systemMessagesEnabled: boolean;
  emailChannelEnabled: boolean;
  smsChannelEnabled: boolean;
  emergencyBanner?: string; // If set, displays on frontend
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  adminAccessLocked: boolean;
  forceLogoutTriggeredAt?: string;
}

export interface ApiSettings {
  publicApiEnabled: boolean;
  partnerApiEnabled: boolean;
  webhookOutgoingEnabled: boolean;
  rotationLastPerformed?: string;
  geminiApiKey?: string;
}

export interface AnalyticsSettings {
  firebaseConfig: string; // Storing the raw pasted string or JSON
  enabled: boolean;
}

export interface AppSettings {
  auth: AuthSettings;
  integrations: IntegrationConfig[];
  api: ApiSettings;
  features: FeatureFlag[];
  platform: PlatformSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  analytics: AnalyticsSettings;
}

export interface SettingsAuditLog {
  id: string;
  adminId: string;
  section: "auth" | "integrations" | "features" | "platform" | "notifications" | "security";
  action: string;
  details: string;
  timestamp: string;
}
