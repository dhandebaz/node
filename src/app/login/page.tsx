"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendOTP, verifyOTP, isLoading, error, host, confirmationResult } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Capture referral code from URL and set cookie
    const refCode = searchParams.get("ref");
    if (refCode) {
      document.cookie = `nodebase-referral-code=${refCode}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, [searchParams]);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  useEffect(() => {
    if (host && !isLoading) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/kaisa");
      }, 1500);
    }
  }, [host, isLoading, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    await sendOTP(phone);
    if (!useAuthStore.getState().error) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    await verifyOTP(otp);
  };

  return (
    <div className="min-h-screen bg-brand-deep-red flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>
      
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

          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-brand-bone/60 text-xs font-bold uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-bone/40 font-medium select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setPhone(val);
                      }}
                      placeholder="98765 43210"
                      className="w-full bg-brand-bone/5 border border-brand-bone/10 rounded-xl px-4 pl-12 py-3 text-brand-bone placeholder:text-brand-bone/20 focus:outline-none focus:border-brand-bone/40 transition-colors font-mono tracking-wider"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full bg-brand-bone text-brand-deep-red hover:bg-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-brand-bone/60 text-xs font-bold uppercase tracking-wider">
                      Enter OTP
                    </label>
                    <button 
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-xs text-brand-bone/40 hover:text-brand-bone transition-colors"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setOtp(val);
                    }}
                    placeholder="• • • • • •"
                    className="w-full bg-brand-bone/5 border border-brand-bone/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-brand-bone placeholder:text-brand-bone/20 focus:outline-none focus:border-brand-bone/40 transition-colors font-mono"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-brand-bone text-brand-deep-red hover:bg-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Login
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div id="recaptcha-container"></div>
          </div>

          <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-brand-bone/30">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </div>
        </motion.div>
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
