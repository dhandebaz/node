"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
} from "lucide-react";
import { BusinessTypeCard } from "@/components/onboarding/BusinessTypeCard";
import { BusinessDetailsForm } from "@/components/onboarding/BusinessDetailsForm";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Confetti } from "@/components/ui/Confetti";
import { BusinessType } from "@/types";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { OmniCompanion } from "@/components/ui/OmniCompanion";

const SETUP_STEPS = [
  { id: 1, label: "Creating secure workspace" },
  { id: 2, label: "Assigning employee role" },
  { id: 3, label: "Preparing workflow memory" },
  { id: 4, label: "Configuring integrations" },
  { id: 5, label: "Finalizing launch posture" },
];

const businessTypeOptions = [
  {
    id: "service_business" as BusinessType,
    title: "Agencies & Consulting",
    description: "Professional services, agencies, and firms selling high-value expertise",
    icon: Building2,
  },
  {
    id: "airbnb_host" as BusinessType,
    title: "Hospitality & Multi-Unit",
    description: "Property managers, rentals, and hospitality network operators",
    icon: Sparkles,
  },
  {
    id: "kirana_store" as BusinessType,
    title: "Retail & E-commerce",
    description: "Modern retail stores handling large message-to-sale volumes",
    icon: Store,
  },
  {
    id: "doctor_clinic" as BusinessType,
    title: "Health & Clinical Ops",
    description: "Medical clinics, dental hubs, and diagnostic service networks",
    icon: Stethoscope,
  },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") as
    | "business_type"
    | "details"
    | "processing"
    | "timeout"
    | null;

  const [step, setStep] = useState<
    "business_type" | "details" | "processing" | "timeout"
  >(initialStep || "business_type");
  const [loading, setLoading] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] =
    useState<BusinessType | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/onboarding/status");
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === "ready") {
          router.push("/dashboard/ai");
        }
      } catch {
        // Silent status failure on mount.
      }
    }

    void checkStatus();
  }, [router]);

  const clearTimers = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (pollInterval.current) clearInterval(pollInterval.current);
  };

  useEffect(() => () => clearTimers(), []);

  const startProcessing = () => {
    const startTime = Date.now();
    const timeoutMs = 30000;

    setCurrentStepIndex(0);
    setProgress(0);

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed > timeoutMs) {
        setStep("timeout");
        clearTimers();
        return;
      }

      setProgress((current) => Math.min(current + 0.5, 95));
      const estimatedIndex = Math.floor(
        (elapsed / timeoutMs) * SETUP_STEPS.length,
      );
      setCurrentStepIndex(Math.min(estimatedIndex, SETUP_STEPS.length - 2));
    }, 100);

    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch("/api/onboarding/status");
        if (!response.ok) return;

        const data = await response.json();
        if (data.status === "ready") {
          clearTimers();
          setProgress(100);
          setCurrentStepIndex(SETUP_STEPS.length - 1);
          setTimeout(() => router.push("/dashboard/ai"), 800);
        }
      } catch {
        // Silent polling failure, visual state stays active.
      }
    }, 1000);
  };

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setSelectedBusinessType(type);
    setStep("details");
  };

  const handleDetailsSubmit = async (details: {
    propertyCount: number;
    platforms: string[];
  }) => {
    try {
      setLoading(true);
      const result = await completeOnboarding(selectedBusinessType!, details);

      if (!result.success) {
        toast.error("Setup failed. Please try again.");
        setLoading(false);
        return;
      }

      setStep("processing");
      startProcessing();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  };

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

  const currentStepLabel =
    step === "business_type"
      ? "Step 1 of 2"
      : step === "details"
        ? "Step 2 of 2"
        : "Provisioning";

  return (
    <div className="public-site min-h-screen">
      <Confetti active={step === "processing" && progress === 100} />
      <div className="public-container py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-b-4 border-indigo-800 transition-transform group-hover:scale-105">
              <Logo className="h-7 w-7" />
            </div>
            <div>
              <div className="font-display text-2xl tracking-tighter text-slate-900 uppercase leading-none">
                nodebase
              </div>
              <div className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Institutional Onboarding
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                {currentStepLabel}
             </div>
             <OmniCompanion size="sm" state="neutral" className="scale-75 origin-right" />
          </div>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center py-10">
          <AnimatePresence mode="wait">
            {step === "business_type" ? (
              <motion.div
                key="business-type"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="w-full space-y-8"
              >
                <section className="bg-white border-2 border-slate-100 p-8 py-12 lg:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-100/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <OmniCompanion 
                      state="happy" 
                      size="md" 
                      bubbleText="Hi! I'm Omni. Let's design your AI workforce together. What's our first mission?"
                      className="mb-8"
                    />
                    
                    <h1 className="font-display text-5xl leading-[0.9] text-slate-900 sm:text-6xl lg:text-7xl uppercase tracking-tighter mb-4">
                      Choose your Operational Ecosystem
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg font-bold text-slate-400 leading-snug">
                      Your choice shapes how I'll automate your specific workflow, triggers, and intelligence mapping.
                    </p>
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {businessTypeOptions.map((option) => (
                    <BusinessTypeCard
                      key={option.id}
                      title={option.title}
                      description={option.description}
                      icon={option.icon}
                      selected={selectedBusinessType === option.id}
                      onSelect={() => handleBusinessTypeSelect(option.id)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : null}

            {step === "details" && selectedBusinessType ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="mx-auto w-full max-w-4xl space-y-8"
              >
                <section className="bg-white border-2 border-slate-100 p-8 rounded-[3.5rem] shadow-2xl shadow-slate-100/50">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <OmniCompanion state="success" size="md" className="shrink-0" />
                    <div className="space-y-3 text-center md:text-left">
                        <h1 className="font-display text-4xl text-slate-900 sm:text-5xl uppercase tracking-tighter leading-none">
                          Perfect choice. Now, defining scope.
                        </h1>
                        <p className="max-w-xl text-lg font-bold text-slate-400 leading-snug">
                          This provides the neural signal needed to refine your autonomous agents and roadmap.
                        </p>
                    </div>
                  </div>
                </section>

                <section className="bg-slate-50 border-2 border-slate-200/50 p-6 sm:p-8 rounded-[3rem]">
                  <BusinessDetailsForm
                    businessType={selectedBusinessType}
                    onSubmit={handleDetailsSubmit}
                    loading={loading}
                  />
                </section>

                <button
                  type="button"
                  onClick={() => setStep("business_type")}
                  className="button-chunky"
                >
                  ← Back to Ecosystems
                </button>
              </motion.div>
            ) : null}

            {step === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="mx-auto w-full max-w-3xl space-y-8"
              >
                <section className="bg-white border-2 border-slate-100 p-8 py-12 text-center rounded-[3.5rem] shadow-2xl shadow-slate-100/50">
                  <div className="relative z-10 space-y-8 flex flex-col items-center">
                    <OmniCompanion 
                        state="thinking" 
                        size="lg" 
                        bubbleText="Sit tight! I'm configuring your secure tunnels and memory clusters..." 
                    />
                    <div>
                      <h1 className="font-display text-5xl text-slate-900 sm:text-6xl uppercase tracking-tighter leading-none mb-4">
                        Provisioning Network
                      </h1>
                      <p className="mx-auto max-w-xl text-lg font-bold text-slate-400 leading-snug">
                        Orchestrating agent permissions, secure workspace architecture, and neural sync.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="public-panel-soft p-6 sm:p-8">
                  <div className="space-y-5">
                    {SETUP_STEPS.map((stepItem, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div
                          key={stepItem.id}
                          className="public-inset flex items-center justify-between gap-4 rounded-2xl px-6 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : isCurrent ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-bold uppercase tracking-tight ${
                                isCompleted || isCurrent
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {stepItem.label}
                            </span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                              Processing
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <div className="rounded-full bg-border/40 p-1">
                      <div
                        className="h-2 rounded-full bg-primary transition-all duration-500 shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {Math.round(progress)}% Complete
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : null}

            {step === "timeout" ? (
              <motion.div
                key="timeout"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="mx-auto w-full max-w-2xl space-y-6"
              >
                <section className="public-panel px-6 py-8 text-center sm:px-8 sm:py-10">
                  <div className="relative z-10 space-y-5">
                    <div className="public-inset mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(214,88,74,0.08)] text-primary">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="public-display text-4xl text-foreground">
                        Setup is taking longer than expected
                      </h1>
                      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                        The workspace may still finish in the background, but
                        the safest next step is to retry or return to the
                        details form.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="public-button-secondary px-6 py-3 text-sm font-semibold"
                  >
                    Back to details
                  </button>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="public-button px-6 py-3 text-sm font-semibold"
                  >
                    Retry setup
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="pb-6 text-center text-sm font-medium text-zinc-500">
          Require assistance?{" "}
          <a
            href="mailto:support@nodebase.space"
            className="font-black text-blue-600 uppercase tracking-widest text-[10px]"
          >
            Contact Institutional Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="public-site min-h-screen">
          <div className="public-container flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
