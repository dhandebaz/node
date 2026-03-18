"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OnboardingChecklistProps {
  stats: {
    listingCount: number;
    walletBalance: number;
    isAiEnabled: boolean;
    integrationCount: number;
  };
  milestones?: string[];
}

export function OnboardingChecklist({ stats, milestones = [] }: OnboardingChecklistProps) {
  const steps = useMemo(() => [
    {
      id: "business_details",
      title: "Complete Business Profile",
      description: "Tell us about your business and goals.",
      completed: true, // They are in the dashboard, so this is true
      href: "/dashboard/ai/settings",
    },
    {
      id: "first_listing",
      title: "Add your first listing",
      description: "Add a property, store, or clinic to manage.",
      completed: stats.listingCount > 0,
      href: "/dashboard/ai/listings/new",
    },
    {
      id: "connect_integration",
      title: "Connect a platform",
      description: "Connect WhatsApp, Instagram, or Airbnb.",
      completed: stats.integrationCount > 0,
      href: "/dashboard/ai/integrations",
    },
    {
      id: "add_credits",
      title: "Add wallet credits",
      description: "Kaisa needs credits to reply to your customers.",
      completed: stats.walletBalance > 0,
      href: "/dashboard/billing",
    },
    {
      id: "enable_ai",
      title: "Enable AI Employee",
      description: "Turn on your AI to start managing tasks.",
      completed: stats.isAiEnabled || milestones.includes("enable_ai"),
      href: "/dashboard/ai/settings",
    },
  ], [stats, milestones]);

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="public-panel overflow-hidden"
    >
      <div className="p-6 border-b border-[var(--public-line)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--public-ink)]">Getting Started</h2>
            <p className="text-sm text-[var(--public-muted)]">Complete these steps to fully activate your AI Employee.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-red">{Math.round(progress)}%</div>
            <div className="text-[10px] text-[var(--public-muted)] uppercase font-bold tracking-widest">Progress</div>
          </div>
        </div>
        <div className="h-3 skeuo-progress-bg mt-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full skeuo-progress-fill"
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              "p-4 flex items-start gap-4 transition-all mx-2 my-1 rounded-xl",
              step.completed ? "opacity-60" : "skeuo-inset bg-white/5"
            )}
          >
            <div className="mt-1">
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "text-sm font-bold",
                step.completed ? "text-[var(--public-muted)]" : "text-[var(--public-ink)]"
              )}>
                {step.title}
              </h3>
              <p className="text-xs text-[var(--public-muted)] mt-1">{step.description}</p>
            </div>
            {!step.completed && (
              <Link 
                href={step.href}
                className="p-2 hover:bg-white/10 rounded-full text-[var(--public-muted)] hover:text-[var(--public-ink)] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
