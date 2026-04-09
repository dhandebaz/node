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
      title: "Add your first Service",
      description: "Define what your business offers (e.g. products, treatments, or space).",
      completed: stats.listingCount > 0,
      href: "/dashboard/ai/listings/new",
    },
    {
      id: "connect_integration",
      title: "Connect external platforms",
      description: "Connect your primary communication channels like WhatsApp or Instagram.",
      completed: stats.integrationCount > 0,
      href: "/dashboard/ai/integrations",
    },
    {
      id: "add_credits",
      title: "Add wallet credits",
      description: "Your AI Assistant needs credits to respond to customers 24/7.",
      completed: stats.walletBalance > 0,
      href: "/dashboard/billing",
    },
    {
      id: "enable_ai",
      title: "Enable AI Assistant",
      description: "Activate your AI to start handling inquiries and tasks.",
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
      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm shadow-zinc-200/50"
    >
      <div className="p-8 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-tighter">Getting Started</h2>
            <p className="text-sm text-zinc-500 font-medium">Complete these steps to fully activate your AI Business Assistant.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-blue-600">{Math.round(progress)}%</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Progress</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mt-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
          />
        </div>
      </div>

      <div className="p-4 space-y-2 bg-zinc-50/50">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              "p-4 flex items-start gap-4 transition-all rounded-xl border border-transparent",
              step.completed 
                ? "opacity-50 grayscale" 
                : "bg-white border-zinc-200 shadow-sm hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5"
            )}
          >
            <div className="mt-1">
              {step.completed ? (
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-300 bg-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "text-sm font-bold uppercase tracking-tight",
                step.completed ? "text-zinc-500 line-through decoration-emerald-500/30" : "text-zinc-950"
              )}>
                {step.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{step.description}</p>
            </div>
            {!step.completed && (
              <Link 
                href={step.href}
                className="p-2 bg-zinc-100 hover:bg-blue-600 hover:text-white rounded-xl text-zinc-400 transition-all group-hover:scale-110"
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
