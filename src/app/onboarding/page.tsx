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
    title: "Service Business",
    description: "Agencies, consultants, and teams selling time or skills",
    icon: Building2,
  },
  {
    id: "airbnb_host" as BusinessType,
    title: "Hospitality & Stays",
    description: "Rentals, homestays, and boutique hotel operators",
    icon: Sparkles,
  },
  {
    id: "kirana_store" as BusinessType,
    title: "Retail & Commerce",
    description: "Stores handling WhatsApp orders and repeat customers",
    icon: Store,
  },
  {
    id: "doctor_clinic" as BusinessType,
    title: "Health & Wellness",
    description: "Clinics, therapists, and front-desk coordination",
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
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Logo className="h-8 w-8" />
            </div>
            <div>
              <div className="font-display text-2xl tracking-tighter text-foreground uppercase">
                nodebase
              </div>
              <div className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Onboarding
              </div>
            </div>
          </Link>
          <div className="public-pill text-[10px] font-black uppercase tracking-widest text-muted-foreground ring-1 ring-border">
            {currentStepLabel}
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
                className="w-full space-y-6"
              >
                <section className="public-panel px-6 py-12 sm:px-8 sm:py-16 lg:px-10 border-b-4 border-primary">
                  <div className="relative z-10 space-y-6 text-center">
                    <div className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                      Welcome to Nodebase
                    </div>
                    <h1 className="font-display text-5xl leading-[0.9] text-foreground sm:text-6xl lg:text-7xl uppercase tracking-tighter">
                      Which workflow are you hiring for first?
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg font-sans text-muted-foreground">
                      Pick the business lane so Nodebase can shape the initial
                      employee, control surfaces, and launch checklist around
                      real operations.
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
                className="mx-auto w-full max-w-3xl space-y-6"
              >
                <section className="public-panel px-6 py-8 sm:px-8 border-b-2 border-primary/20">
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                      Setup details
                    </div>
                    <h1 className="font-display text-4xl text-foreground sm:text-5xl uppercase tracking-tighter leading-none">
                      Tell us how the workflow runs today.
                    </h1>
                    <p className="max-w-xl text-lg text-muted-foreground">
                      This gives the system enough signal to prepare the first
                      employee and tailor the onboarding path.
                    </p>
                  </div>
                </section>

                <section className="public-panel-soft p-6 sm:p-8">
                  <BusinessDetailsForm
                    businessType={selectedBusinessType}
                    onSubmit={handleDetailsSubmit}
                    loading={loading}
                  />
                </section>

                <button
                  type="button"
                  onClick={() => setStep("business_type")}
                  className="public-button-secondary px-5 py-3 text-sm font-semibold"
                >
                  Back to business selection
                </button>
              </motion.div>
            ) : null}

            {step === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="mx-auto w-full max-w-3xl space-y-6"
              >
                <section className="public-panel px-6 py-12 text-center sm:px-8 border-b-4 border-primary">
                  <div className="relative z-10 space-y-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary ring-1 ring-primary/20">
                      <Sparkles className="h-10 w-10 animate-pulse" />
                    </div>
                    <div>
                      <h1 className="font-display text-5xl text-foreground sm:text-6xl uppercase tracking-tighter leading-none">
                        Provisioning workspace
                      </h1>
                      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                        Hold for a moment while the employee role, initial
                        settings, and workspace structure are prepared.
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

        <div className="pb-6 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:support@nodebase.space"
            className="font-semibold text-primary"
          >
            Contact support
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
