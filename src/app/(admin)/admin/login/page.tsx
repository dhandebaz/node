"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await sendOtpAction(phone);
      if (res.success) {
        setStep("otp");
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await verifyOtpAction(phone, otp);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.message || "Failed to verify OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-zinc-400 text-sm mt-2">Secure Internal Control Plane</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="+91"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="000000"
                  required
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                OTP sent to {phone}. <button type="button" onClick={() => setStep("phone")} className="text-zinc-300 underline">Change</button>
              </p>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center mt-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Login"}
              </button>
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
}
