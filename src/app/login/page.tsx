"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2, Wallet, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendAuthCode, verifyPhoneOTP, signInWithOAuth, isLoading: authLoading, error: authError, host } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Capture referral code from URL and set cookie
    const refCode = searchParams.get("ref");
    if (refCode) {
      document.cookie = `nodebase-referral-code=${refCode}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, [searchParams]);

  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'contact' | 'otp' | 'magic-link-sent'>('contact');
  const [localLoading, setLocalLoading] = useState(false);

  // Check session on mount to redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
         setShowSuccess(true);
         setTimeout(() => {
            router.push("/dashboard/ai");
         }, 1000);
      }
    };
    checkSession();
  }, [router]);

  const handleSendAuthCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setLocalLoading(true);
    try {
      // Determine if email or phone
      const isEmail = contact.includes('@');
      const supabase = getSupabaseBrowser();
      if (isEmail) {
         const { error } = await supabase.auth.signInWithOtp({
            email: contact,
            options: {
               emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
         });
         if (error) throw error;
         setStep('magic-link-sent');
      } else {
         // Phone logic
         const formattedPhone = contact.startsWith('+') ? contact : '+91' + contact;
         const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone
         });
         if (error) throw error;
         setStep('otp');
      }
    } catch (err) {
      console.error(err);
      // Allow retry
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setLocalLoading(true);
    try {
      const formattedPhone = contact.startsWith('+') ? contact : '+91' + contact;
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/ai");
      }, 1000);
    } catch (err) {
       console.error(err);
    } finally {
       setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setLocalLoading(false);
    }
  };

  const isLoading = authLoading || localLoading;

  return (
    <div className="min-h-screen bg-brand-deep-red flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="w-full max-w-md relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-brand-bone/60 hover:text-brand-bone mb-8 transition-colors text-sm font-medium uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-bone/5 backdrop-blur-md rounded-3xl p-8 border border-brand-bone/10 shadow-2xl relative overflow-hidden"
        >
          {showSuccess ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-brand-deep-red/95 z-20 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500 border border-green-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-brand-bone mb-2 uppercase tracking-tight">Welcome back!</h2>
              <p className="text-brand-bone/60">Redirecting to your dashboard...</p>
            </motion.div>
          ) : null}

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-brand-bone mb-2 uppercase tracking-tight">Sign in to Nodebase</h1>
            <p className="text-brand-bone/60 text-sm">Manage your AI Workforce</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
            
            <button
              disabled={true}
              className="flex items-center justify-center gap-3 bg-[#333] text-white font-bold py-3 px-4 rounded-xl opacity-50 cursor-not-allowed"
            >
              <Wallet className="w-5 h-5" />
              Connect Web3 Wallet (Coming Soon)
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-bone/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-deep-red px-2 text-brand-bone/40 tracking-widest">Or continue with</span>
            </div>
          </div>

          <form onSubmit={step === 'otp' ? handleVerifyOTP : handleSendAuthCode} className="space-y-4">
            {step === 'contact' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-bone/60 uppercase tracking-wider ml-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                  className="w-full bg-brand-bone/5 border border-brand-bone/10 rounded-xl px-4 py-3 text-brand-bone placeholder:text-brand-bone/20 focus:outline-none focus:border-brand-bone/30 transition-all"
                  required
                />
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-bone/60 uppercase tracking-wider ml-1">
                  Enter OTP sent to {contact}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-brand-bone/5 border border-brand-bone/10 rounded-xl px-4 py-3 text-brand-bone placeholder:text-brand-bone/20 focus:outline-none focus:border-brand-bone/30 transition-all text-center tracking-[0.5em] font-mono text-xl"
                  autoFocus
                  required
                />
              </div>
            )}

            {step === 'magic-link-sent' && (
               <div className="text-center p-6 bg-brand-bone/5 rounded-xl border border-brand-bone/10">
                  <Mail className="w-12 h-12 text-brand-bone mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-brand-bone mb-2">Check your email</h3>
                  <p className="text-brand-bone/60 text-sm">We sent a magic link to <strong>{contact}</strong></p>
                  <button 
                    type="button"
                    onClick={() => setStep('contact')}
                    className="text-brand-bone/40 text-xs mt-4 hover:text-brand-bone/60"
                  >
                    Try different email
                  </button>
               </div>
            )}

            {step !== 'magic-link-sent' && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-bone text-brand-deep-red hover:bg-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                  step === 'otp' ? 'Verify & Login' : 'Continue'
                )}
              </button>
            )}
          </form>
        </motion.div>
        
        <p className="text-center text-brand-bone/30 text-xs mt-8 max-w-xs mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-deep-red flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-bone animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
