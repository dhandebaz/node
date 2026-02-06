"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Smartphone, ShieldCheck, Cpu, Cloud, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginWithFirebaseToken } from "@/app/actions/auth";
import { auth } from "@/lib/firebase/client";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export const dynamic = 'force-dynamic';

type Product = "kaisa" | "space" | "node";

const PRODUCTS = [
  { 
    id: "kaisa", 
    name: "kaisa AI", 
    description: "Agentic Managers for Business",
    icon: Sparkles, 
    color: "from-blue-500 to-cyan-500",
    accent: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/10"
  },
  { 
    id: "space", 
    name: "Space Cloud", 
    description: "Next-Gen Hosting & Storage",
    icon: Cloud, 
    color: "from-purple-500 to-pink-500",
    accent: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10"
  },
  { 
    id: "node", 
    name: "Node Network", 
    description: "Decentralized Infrastructure",
    icon: Cpu, 
    color: "from-emerald-500 to-green-500",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10"
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product>("kaisa");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminSelection, setShowAdminSelection] = useState(false);
  const [adminRedirects, setAdminRedirects] = useState<{ admin: string, sandbox: string }>({ admin: "/admin", sandbox: "/dashboard" });
  
  // Auth State
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const activeProduct = PRODUCTS.find(p => p.id === selectedProduct)!;

  const initRecaptcha = () => {
    if (!auth) {
      console.error("Firebase Auth not initialized. Cannot init Recaptcha.");
      return null;
    }
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    if (!recaptchaContainerRef.current) {
        console.error("Recaptcha container not found.");
        return null;
    }

    try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved
            }
        });
        recaptchaVerifierRef.current = verifier;
        return verifier;
    } catch (e) {
        console.error("Recaptcha Init Error:", e);
        return null;
    }
  };

  useEffect(() => {
    const verifier = initRecaptcha();
    
    return () => {
        if (recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current.clear();
            } catch (e) {
                console.error("Error clearing recaptcha:", e);
            }
            recaptchaVerifierRef.current = null;
        }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Ensure Recaptcha is initialized
      let appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
          appVerifier = initRecaptcha();
      }

      // 1. Check if we have a valid verifier
      if (!appVerifier) {
          if (!auth) {
              throw new Error("Firebase Authentication is not available. Please check system configuration.");
          }
          throw new Error("Recaptcha could not be initialized. Please refresh and try again.");
      }
      
      // Ensure phone format is E.164
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/^0+/, "")}`;
      
      console.log("Sending OTP via Firebase to:", formattedPhone);
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");

    } catch (firebaseError: any) {
      console.error("Firebase OTP failed:", firebaseError);
      setError(firebaseError.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Verify via Firebase
      if (!confirmationResult) {
          throw new Error("No verification session found.");
      }
      
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();
      
      // Exchange Token for Session (Server Action)
      const res = await loginWithFirebaseToken(idToken, selectedProduct);
      
      if (res.success) {
        if (res.isSuperAdmin) {
            // Show Admin Selection
            setAdminRedirects({
                admin: "/admin",
                sandbox: res.redirect || "/dashboard"
            });
            setShowAdminSelection(true);
        } else if (res.redirect) {
            router.push(res.redirect);
        }
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err: any) {
      console.error("Verification Error:", err);
      setError("Invalid OTP or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showAdminSelection) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 blur-[100px]`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-indigo-500 to-purple-500 opacity-10 blur-[100px]`} />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center"
            >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-indigo-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Detected</h2>
                <p className="text-zinc-400 mb-8">
                    Welcome back. You can access the master admin dashboard or browse the customer portal in sandbox mode.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push(adminRedirects.admin)}
                        className="w-full py-3.5 px-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                    >
                        Enter Admin Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                        onClick={() => router.push(adminRedirects.sandbox)}
                        className="w-full py-3.5 px-4 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                    >
                        <Sparkles className="w-4 h-4 text-zinc-400" />
                        Enter Sandbox Mode
                    </button>
                </div>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Invisible Recaptcha Container */}
      <div ref={recaptchaContainerRef} id="recaptcha-container"></div>

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Nodebase</span>
      </Link>

      {/* Background Gradients */}
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br ${activeProduct.color} opacity-10 blur-[100px] transition-all duration-1000`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl ${activeProduct.color} opacity-10 blur-[100px] transition-all duration-1000`} />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Sign in to Nodebase</h1>
          <p className="text-zinc-400">Manage your AI, Hosting, and Infrastructure.</p>
        </div>

        {/* Product Switcher */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-1.5 mb-8 flex gap-1 relative">
           {PRODUCTS.map((product) => (
             <button
                key={product.id}
                onClick={() => {
                    setSelectedProduct(product.id as Product);
                    setStep("phone"); // Reset step on switch? Maybe better UX to keep phone if filled, but simple for now.
                    setError("");
                }}
                className={`flex-1 relative py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedProduct === product.id 
                        ? "text-white shadow-lg bg-zinc-800" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
             >
                <product.icon className={`w-4 h-4 ${selectedProduct === product.id ? product.accent : ""}`} />
                {product.name}
                {selectedProduct === product.id && (
                    <motion.div 
                        layoutId="active-pill"
                        className={`absolute inset-0 rounded-xl border border-zinc-700 pointer-events-none`}
                    />
                )}
             </button>
           ))}
        </div>

        {/* Login Card */}
        <motion.div 
            layout
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
            {/* Dynamic Border Top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeProduct.color}`} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedProduct}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 text-center"
                >
                    <div className={`w-12 h-12 rounded-xl ${activeProduct.bg} ${activeProduct.border} border flex items-center justify-center mx-auto mb-4`}>
                        <activeProduct.icon className={`w-6 h-6 ${activeProduct.accent}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{activeProduct.name}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{activeProduct.description}</p>
                </motion.div>
            </AnimatePresence>

            {step === "phone" ? (
                <motion.form 
                    key="phone-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendOtp} 
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                            Mobile Number
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                                placeholder="+91 98765 43210"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-red-400 text-sm bg-red-900/10 border border-red-900/20 p-3 rounded-lg flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className={`w-full font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isLoading || phone.length < 10
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </motion.form>
            ) : (
                <motion.form 
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleVerifyOtp} 
                    className="space-y-4"
                >
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400 mb-2">
                            <span>Sent to {phone}</span>
                            <button 
                                type="button" 
                                onClick={() => { setStep("phone"); setError(""); }}
                                className="text-white hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                            Verification Code
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 tracking-widest text-lg"
                                placeholder="000000"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-red-400 text-sm bg-red-900/10 border border-red-900/20 p-3 rounded-lg flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className={`w-full font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isLoading || otp.length < 6
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </motion.form>
            )}
        </motion.div>
      </div>
    </div>
  );
}
