"use client";

import { useState, useEffect, useRef } from "react";
import { BusinessTypeCard } from "@/components/onboarding/BusinessTypeCard";
import { BusinessDetailsForm } from "@/components/onboarding/BusinessDetailsForm";
import { completeOnboarding } from "@/app/actions/onboarding";
import { BusinessType } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"business_type" | "details" | "processing" | "timeout">("business_type");
  const [loading, setLoading] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [progress, setProgress] = useState(0);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setStep("details");
  };

  const startProcessing = () => {
    const startTime = Date.now();
    const TIMEOUT_MS = 30000; // 30s
    
    // Progress Animation: 0 -> 100% in 250ms increments
    // We want it to reach ~95% by 30s, and jump to 100% when ready.
    // 30s / 250ms = 120 steps.
    // 95 / 120 = ~0.8% per step.
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        setStep("timeout");
        clearTimers();
        return;
      }
      
      setProgress(p => Math.min(p + 0.8, 95));
    }, 250);

    // Polling: Every 500ms
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        
        if (data.status === "ready") {
          clearTimers();
          setProgress(100);
          setTimeout(() => {
            router.push("/dashboard/ai");
          }, 500);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 500);
  };

  const handleDetailsSubmit = async (details: { propertyCount: number; platforms: string[] }) => {
    try {
      console.log("Starting onboarding submission...", details); // Debug log
      setLoading(true);
      const result = await completeOnboarding(selectedBusinessType!, details);
      console.log("Submission result:", result); // Debug log
      
      if (result.success) {
          setStep("processing");
          startProcessing();
      } else {
          console.error("Submission failed but no error thrown");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setLoading(false);
    }
  };

  const clearTimers = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (pollInterval.current) clearInterval(pollInterval.current);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleRetry = () => {
    setStep("processing");
    setProgress(0);
    startProcessing();
  };

  const handleCancel = () => {
    clearTimers();
    setStep("details");
    setLoading(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone selection:bg-brand-bone/20 font-sans bg-grid-pattern flex flex-col">
      {/* Header */}
      <div className="p-6 md:p-8 flex justify-between items-center">
        <Logo className="w-8 h-8 md:w-10 md:h-10" />
        <div className="text-xs font-bold uppercase tracking-widest opacity-60">
            {step === 'processing' || step === 'timeout' ? 'Finalizing...' : `Setup Step ${step === 'business_type' ? '1' : '2'} of 2`}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-20">
        <div className="max-w-5xl w-full space-y-12 text-center">
          
          {step === "business_type" && (
            <>
              <div className="space-y-4">
                <div className="inline-block border border-brand-bone/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 mb-2">
                    Welcome to Nodebase
                </div>
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                    Who are you hiring for?
                </h1>
                <p className="text-xl text-brand-bone/60 max-w-2xl mx-auto">
                    Select your business model to configure your AI Employee's training data.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                <BusinessTypeCard
                  title="Airbnb Host"
                  description="Homestays & Rentals"
                  icon="🏠"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("airbnb_host")}
                />
                <BusinessTypeCard
                  title="Kirana Store"
                  description="Local Shops & Retail"
                  icon="🛒"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("kirana_store")}
                />
                <BusinessTypeCard
                  title="Doctor / Clinic"
                  description="Appointments & FAQ"
                  icon="🩺"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("doctor_clinic")}
                />
                <BusinessTypeCard
                  title="Thrift Store"
                  description="Instagram Sales"
                  icon="🧥"
                  selected={false}
                  onSelect={() => handleBusinessTypeSelect("thrift_store")}
                />
              </div>
            </>
          )}

          {step === "details" && selectedBusinessType && (
            <div className="max-w-xl mx-auto text-left">
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">Almost Done</h1>
                <p className="text-brand-bone/60">Tell us a bit more about your operations.</p>
              </div>
              
              <div className="bg-brand-bone/5 border border-brand-bone/10 rounded-3xl p-8 backdrop-blur-sm">
                  <BusinessDetailsForm 
                    businessType={selectedBusinessType} 
                    onSubmit={handleDetailsSubmit} 
                    loading={loading} 
                  />
              </div>
              
              <button 
                onClick={() => setStep("business_type")}
                className="mt-6 text-sm text-brand-bone/40 hover:text-brand-bone uppercase tracking-wider font-bold mx-auto block transition-colors"
              >
                ← Back to Selection
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="max-w-md mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Setting up your workspace</h2>
                <p className="text-brand-bone/60">Please wait while we configure your AI employee...</p>
              </div>
              
              <div className="relative w-full h-2 bg-brand-bone/10 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-brand-bone"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.25 }}
                />
              </div>
              
              <div className="text-xs font-mono text-brand-bone/40">
                {Math.round(progress)}% Complete
              </div>
            </div>
          )}

          {step === "timeout" && (
            <div className="max-w-md mx-auto bg-brand-bone/5 border border-red-500/30 p-8 rounded-3xl backdrop-blur-sm">
               <div className="flex justify-center mb-6 text-red-400">
                 <AlertTriangle size={48} />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Setup Timeout</h3>
               <p className="text-brand-bone/60 mb-8">
                 It's taking longer than expected to configure your workspace. You can retry or contact support.
               </p>
               <div className="flex gap-4 justify-center">
                 <button 
                   onClick={handleCancel}
                   className="px-6 py-2 text-sm font-bold uppercase tracking-wider text-brand-bone/60 hover:text-brand-bone transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleRetry}
                   className="px-6 py-2 bg-brand-bone text-brand-deep-red text-sm font-bold uppercase tracking-wider rounded-full hover:bg-white transition-colors"
                 >
                   Retry
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
      
      <div className="fixed bottom-6 left-0 right-0 text-center text-xs text-brand-bone/30 uppercase tracking-widest">
        Need help? <a href="mailto:support@nodebase.com" className="text-brand-bone/60 hover:text-brand-bone underline transition-colors">Contact Support</a>
      </div>
    </div>
  );
}
