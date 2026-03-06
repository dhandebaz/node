"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2, Wallet, Mail, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

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

  const isLoading = authLoading || localLoading;

  return (
    <div className="min-h-screen bg-brand-deep-red flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-grid-pattern relative overflow-hidden font-sans text-brand-bone selection:bg-brand-bone/20">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <Link href="/" className="flex justify-center mb-8 hover:scale-105 transition-transform">
          <Logo className="w-20 h-20" />
        </Link>
        
        <h2 className="text-center text-4xl font-bold uppercase tracking-tighter text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-brand-bone/70 text-lg font-light">
          Sign in to manage your AI workforce
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-brand-bone/10 backdrop-blur-md py-8 px-4 shadow-2xl border border-brand-bone/20 sm:rounded-3xl sm:px-10">
          
          {showSuccess ? (
            <div className="text-center py-12">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Success!</h3>
              <p className="text-brand-bone/70 mt-2">Redirecting to dashboard...</p>
            </div>
          ) : step === 'magic-link-sent' ? (
             <div className="text-center py-8">
               <div className="w-16 h-16 bg-brand-bone/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Mail className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Check your email</h3>
               <p className="text-brand-bone/70 mb-6">
                 We sent a magic link to <span className="font-bold text-white">{contact}</span>
               </p>
               <button 
                 onClick={() => setStep('contact')}
                 className="text-sm text-brand-bone underline hover:text-white"
               >
                 Use a different email
               </button>
             </div>
          ) : (
            <div className="space-y-6">
              
              {/* Google Sign In */}
              <div>
                <button
                  onClick={() => signInWithOAuth('google')}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-xl shadow-sm bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-bone transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 20.45c4.6667 0 7.3333-3.3333 7.3333-8.6667 0-.6-.0666-1.1333-.1333-1.6666H12.0003v3.3333h4.1333c-.2 1.2667-1.3333 3.6667-4.1333 3.6667-2.4667 0-4.5333-1.6667-5.2667-3.9333-.2-.6667-.3333-1.3334-.3333-2.1334s.1333-1.4667.3333-2.1333c.7334-2.2667 2.8-3.9334 5.2667-3.9334 1.4 0 2.6.5333 3.5333 1.4l2.5334-2.5333C16.5336 2.3833 14.4669 1.5167 12.0003 1.5167 6.3336 1.5167 1.6669 6.1834 1.6669 11.85s4.6667 10.3333 10.3334 10.3333z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Continue with Google
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-bone/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-brand-deep-red text-brand-bone/60 font-mono text-xs uppercase tracking-widest">
                    Or continue with
                  </span>
                </div>
              </div>

              {step === 'contact' ? (
                <form onSubmit={handleSendAuthCode} className="space-y-6">
                  <div>
                    <label htmlFor="contact" className="block text-xs font-bold uppercase tracking-widest text-brand-bone/70 mb-2">
                      Email or Phone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        id="contact"
                        name="contact"
                        type="text"
                        autoComplete="username"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="name@company.com or 9876543210"
                        className="block w-full px-4 py-3 rounded-xl bg-brand-bone/5 border border-brand-bone/20 text-white placeholder-brand-bone/30 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider text-brand-deep-red bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-bone transition-all transform hover:scale-[1.02]"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Continue"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-widest text-brand-bone/70 mb-2">
                      Enter OTP
                    </label>
                    <div className="mt-1">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        autoComplete="one-time-code"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="block w-full px-4 py-3 rounded-xl bg-brand-bone/5 border border-brand-bone/20 text-white placeholder-brand-bone/30 text-center tracking-[1em] font-mono text-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                       <p className="text-xs text-brand-bone/50">Sent to {contact}</p>
                       <button 
                         type="button" 
                         onClick={() => setStep('contact')}
                         className="text-xs text-brand-bone underline hover:text-white"
                       >
                         Change
                       </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider text-brand-deep-red bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-bone transition-all transform hover:scale-[1.02]"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Login"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-brand-deep-red flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-white animate-spin" />
       </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
