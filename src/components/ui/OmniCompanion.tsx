"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type OmniState = "happy" | "thinking" | "success" | "neutral";

interface OmniCompanionProps {
  state?: OmniState;
  bubbleText?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const STATE_ASSETS: Record<OmniState, string> = {
  neutral: "/omni_mascot_concept_1_1775828803520.png",
  happy: "/omni_mascot_celebration_1775828825257.png",
  success: "/omni_mascot_celebration_1775828825257.png",
  thinking: "/omni_mascot_concept_1_1775828803520.png", // Will add specific thinking asset later
};

const SIZE_MAP = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-40 h-40",
  xl: "w-64 h-64",
};

export function OmniCompanion({ 
  state = "neutral", 
  bubbleText, 
  className,
  size = "md" 
}: OmniCompanionProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <AnimatePresence mode="wait">
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-4 relative bg-white rounded-3xl p-5 shadow-2xl border-2 border-slate-100 max-w-[240px] z-10"
          >
            <p className="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
              {bubbleText}
            </p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={state}
        initial={{ y: 20, opacity: 0, rotate: -5 }}
        animate={{ y: [0, -10, 0], opacity: 1, rotate: 0 }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.5 }
        }}
        className={cn("relative overflow-visible", SIZE_MAP[size])}
      >
        <Image
          src={STATE_ASSETS[state]}
          alt={"Omni Mascot"}
          fill
          className="object-contain"
          priority
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full scale-150" />
      </motion.div>
    </div>
  );
}
