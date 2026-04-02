import { create } from 'zustand';
import { Host } from '@/types';
import { authApi } from '@/lib/api/auth';
import { getSupabaseBrowser } from '@/lib/supabase/client';

/** Default phone country prefix. Externalize to an env var if multi-region support is needed. */
const DEFAULT_PHONE_PREFIX = '+91';

interface AuthState {
  host: Host | null;
  isLoading: boolean;
  error: string | null;
  
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  sendAuthCode: (contact: string) => Promise<'email' | 'phone'>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  fetchHost: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  host: null,
  isLoading: false,
  error: null,

  signInWithOAuth: async (provider: 'google' | 'facebook') => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({ 
      provider, 
      options: { 
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/ai`
      } 
    });
  },

  sendAuthCode: async (contact: string) => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseBrowser();
    try {
      if (contact.includes('@')) {
        const { error } = await supabase.auth.signInWithOtp({ 
            email: contact,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/ai`
            }
        });
        if (error) throw error;
        set({ isLoading: false });
        return 'email';
      } else {
        const formattedPhone = contact.startsWith('+') ? contact : `${DEFAULT_PHONE_PREFIX}${contact}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) throw error;
        set({ isLoading: false });
        return 'phone';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send auth code';
      console.error('Auth Code Send Error:', err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyPhoneOTP: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseBrowser();
    
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      
      // Fetch the real host profile instead of setting a placeholder
      await get().fetchHost();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      console.error('OTP Verify Error:', err);
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    set({ host: null });
    const supabase = getSupabaseBrowser();
    supabase.auth.signOut();
  },

  fetchHost: async () => {
    set({ isLoading: true, error: null });
    try {
      const host = await authApi.getCurrentHost();
      set({ host, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
