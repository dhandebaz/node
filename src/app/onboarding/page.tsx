"use client";

import { useState, useEffect, useRef } from "react";
import { BusinessTypeCard } from "@/components/onboarding/BusinessTypeCard";
import { BusinessDetailsForm } from "@/components/onboarding/BusinessDetailsForm";
import { completeOnboarding } from "@/app/actions/onboarding";
import { BusinessType } from "@/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Confetti } from "@/components/ui/Confetti";
import { toast } from "sonner";

const SETUP_STEPS = [
    { id: 1, label: "Initializing secure workspace" },
    { id: 2, label: "Allocating AI resources" },
    { id: 3, label: "Configuring knowledge base" },
    { id: 4, label: "Connecting platform integrations" },
    { id: 5, label: "Finalizing setup" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"business_type" | "details" | "processing" | "timeout">("business_type");
  const [loading, setLoading] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Check if user is already onboarded on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/onboarding/status");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "ready") {
            router.push("/dashboard/ai");
          }
        }
      } catch (e) {
        console.error("Mount check error:", e);
      }
    }
    checkStatus();
  }, [router]);

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setStep("details");
  };

  const startProcessing = () => {
    const startTime = Date.now();
    const TIMEOUT_MS = 30000; // 30s
    const STEP_DURATION = 4000; // 4s per step roughly
    
    // Reset states
    setCurrentStepIndex(0);
    setProgress(0);

    // Simulate steps progressing
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > TIMEOUT_MS) {
        setStep("timeout");
        clearTimers();
        return;
      }
      
      // Calculate visual progress (0-100)
      // We cap it at 95% until we get the actual "ready" signal
      setProgress(p => Math.min(p + 0.5, 95));

      // Update current step index based on progress/time
      // Map 0-90% to steps 0-3. Step 4 is "Finalizing"
      const estimatedIndex = Math.floor((elapsed / TIMEOUT_MS) * (SETUP_STEPS.length));
      setCurrentStepIndex(Math.min(estimatedIndex, SETUP_STEPS.length - 2)); // Don't go to last step yet

    }, 100);

    // Polling: Every 1s
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        
        if (data.status === "ready") {
          clearTimers();
          setProgress(100);
          setCurrentStepIndex(SETUP_STEPS.length - 1); // Final step
          
          // Small delay for user to see "100%"
          setTimeout(() => {
            router.push("/dashboard/ai");
          }, 800);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 1000);
  };

  const handleDetailsSubmit = async (details: { propertyCount: number; platforms: string[] }) => {
    try {
      console.log("Starting onboarding submission...", details); 
      setLoading(true);
      const result = await completeOnboarding(selectedBusinessType!, details);
      console.log("Submission result:", result); 
      
      if (result.success) {
          setStep("processing");
          startProcessing();
      } else {
          console.error("Submission failed but no error thrown");
          toast.error("Submission failed. Please try again.");
          setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(errorMessage);
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
    <>
      <Confetti active={step === "processing" && progress === 100} />
      {/* Header */}
      <div className="p-6 md:p-8 flex justify-end items-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-60">
            {step === 'processing' || step === 'timeout' ? 'Finalizing...' : `Setup Step ${step === 'business_type' ? '1' : '2'} of 2`}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-20">
        <div className="max-w-5xl w-full space-y-12 text-center">
          
          {step === "business_type" && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="contents"
            >
              <div className="space-y-4">
                <div className="inline-block border border-brand-bone/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-brand-bone/5 text-brand-bone/60 mb-2">
                    Welcome to Nodebase
                </div>
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">
                    Who are you hiring for?
                </h1>
                <p className="text-xl text-brand-bone/60 max-w-2xl mx-auto">
                    Select your business model to configure your AI Employee&apos;s training data.
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
            </motion.div>
          )}

          {step === "details" && selectedBusinessType && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-xl mx-auto text-left"
            >
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
            </motion.div>
          )}

          {step === "processing" && (
            <div className="max-w-md mx-auto text-center space-y-8">
              <div className="space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-black mb-6"
                >
                    <Sparkles size={32} className="animate-pulse" />
                </motion.div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Setting up your workspace</h2>
                <p className="text-brand-bone/60">Hold tight! We&apos;re configuring your AI employee.</p>
              </div>
              
              <div className="space-y-3 text-left bg-brand-bone/5 p-6 rounded-2xl border border-brand-bone/10 backdrop-blur-sm">
                {SETUP_STEPS.map((stepItem, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                        <div key={stepItem.id} className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isCompleted ? (
                                    <CheckCircle2 size={18} className="text-green-400" />
                                ) : isCurrent ? (
                                    <Loader2 size={16} className="animate-spin text-brand-bone" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-brand-bone/20" />
                                )}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                                isCompleted || isCurrent ? "text-brand-bone" : "text-brand-bone/30"
                            }`}>
                                {stepItem.label}...
                            </span>
                        </div>
                    );
                })}
              </div>
              
              <div className="relative w-full h-1 bg-brand-bone/10 rounded-full overflow-hidden mt-8">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-brand-bone"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.25 }}
                />
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
                 It&apos;s taking longer than expected to configure your workspace. You can retry or contact support.
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
      
      <div className="fixed bottom-6 left-0 right-0 text-center text-xs text-brand-bone/30 uppercase tracking-widest pointer-events-none">
        Need help? <a href="mailto:support@nodebase.com" className="text-brand-bone/60 hover:text-brand-bone underline transition-colors pointer-events-auto">Contact Support</a>
      </div>
    </>
  );
}
