import { create } from 'zustand';
import { Host } from '@/types';
import { authApi } from '@/lib/api/auth';
import { auth } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { loginWithFirebaseToken } from '@/app/actions/auth';

interface AuthState {
  host: Host | null;
  isLoading: boolean;
  error: string | null;
  confirmationResult: ConfirmationResult | null;
  
  loginWithGoogle: () => Promise<void>; // @deprecated - Moved to Integrations
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => void;
  fetchHost: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  host: null,
  isLoading: false,
  error: null,
  confirmationResult: null,

  loginWithGoogle: async () => {
    // Deprecated for Auth. Moved to Integrations.
    // This method is left here temporarily to avoid breaking types until full migration.
    console.warn("Google Login is no longer supported for authentication. Use Phone OTP.");
    set({ error: "Google Login is no longer supported. Please use Phone OTP.", isLoading: false });
  },

  sendOTP: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!auth) throw new Error("Firebase not initialized");
      
      // Ensure phone has +91 if not present (assuming India for now based on context)
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

      // Initialize RecaptchaVerifier
      // Note: The "recaptcha-container" ID must exist in the DOM
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      set({ confirmationResult, isLoading: false });
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      set({ error: error.message || "Failed to send OTP", isLoading: false });
    }
  },

  verifyOTP: async (otp: string) => {
    set({ isLoading: true, error: null });
    const { confirmationResult } = get();
    
    if (!confirmationResult) {
      set({ error: "No OTP session found", isLoading: false });
      return;
    }

    try {
      // 1. Verify with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // 2. Login with Server Action
      const response = await loginWithFirebaseToken(idToken);

      if (!response.success) {
        throw new Error(response.message);
      }

      // 3. Fetch Host/User details (or rely on redirect)
      // For now, we assume the server handles the session, but we update local state if needed.
      // Since the server action redirects, we might not reach here in some flows, 
      // but for SPA feel we might want to fetch user.
      // Let's rely on the page component to handle redirect for now, 
      // or fetch the host here if we want to update the UI before redirect.
      
      // We'll set a temporary "host" object to satisfy the "isLoggedIn" check
      // until the real one is fetched or page reloads.
      set({ 
        host: { 
          id: result.user.uid, 
          email: result.user.email || "", 
          phone: result.user.phoneNumber || "",
          name: result.user.displayName || "User",
          role: response.isSuperAdmin ? "superadmin" : "customer" 
        } as any, // minimal mock until fetch
        isLoading: false 
      });

    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      set({ error: error.message || "Invalid OTP", isLoading: false });
    }
  },

  logout: () => {
    set({ host: null, confirmationResult: null });
    // In a real app, we'd also call an API to clear the session cookie
  },

  fetchHost: async () => {
    set({ isLoading: true, error: null });
    try {
      const host = await authApi.getCurrentHost();
      set({ host, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
