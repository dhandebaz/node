"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { NetworkBackground } from "@/components/ui/NetworkBackground";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, sendOTP, verifyOTP, isLoading, error, host, confirmationResult } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

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

            {/* Google Login - Secondary Option */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-brand-bone text-brand-deep-red hover:bg-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden uppercase tracking-wider text-sm"
            >
              {isLoading && !confirmationResult ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-deep-red" />
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-bone/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-brand-bone/40 uppercase tracking-widest text-xs">or sign in with phone</span>
              </div>
            </div>
            
            {/* Recaptcha Container - Must persist across steps */}
            <div id="recaptcha-container"></div>

            {/* Phone OTP Login - Primary Option */}
            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-bone/60 mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-bone/40 font-medium">+91</span>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 bg-brand-bone/5 border border-brand-bone/10 rounded-xl focus:ring-2 focus:ring-brand-bone/20 focus:border-brand-bone/30 outline-none transition-all font-medium text-brand-bone placeholder:text-brand-bone/20"
                      placeholder="99999 99999"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full bg-brand-bone/10 text-brand-bone border border-brand-bone/20 font-bold py-3 px-4 rounded-xl hover:bg-brand-bone hover:text-brand-deep-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                 <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-bone/60">Enter OTP</label>
                    <button 
                      type="button" 
                      onClick={() => setStep('phone')}
                      className="text-xs text-brand-bone/60 hover:text-brand-bone hover:underline uppercase tracking-wider"
                    >
                      Change Number
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-brand-bone/5 border border-brand-bone/10 rounded-xl focus:ring-2 focus:ring-brand-bone/20 focus:border-brand-bone/30 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono text-brand-bone placeholder:text-brand-bone/20"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-brand-bone/10 text-brand-bone border border-brand-bone/20 font-bold py-3 px-4 rounded-xl hover:bg-brand-bone hover:text-brand-deep-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                </button>
              </form>
            )}

          </div>

          <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-brand-bone/30">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
