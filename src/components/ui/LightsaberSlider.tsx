"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface LightsaberSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  color?: "blue" | "green" | "red" | "purple" | "saffron";
}

export function LightsaberSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  color = "blue"
}: LightsaberSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(0);

  // Map color names to Tailwind/CSS classes or hex values
  const colorMap = {
    blue: {
      beam: "bg-white",
      glow: "shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]",
      thumb: "bg-white",
      thumbGlow: "shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.8)]"
    },
    green: {
      beam: "bg-white",
      glow: "shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]",
      thumb: "bg-white",
      thumbGlow: "shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.8)]"
    },
    red: {
      beam: "bg-white",
      glow: "shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]",
      thumb: "bg-white",
      thumbGlow: "shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.8)]"
    },
    purple: {
      beam: "bg-white",
      glow: "shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]",
      thumb: "bg-white",
      thumbGlow: "shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.8)]"
    },
    saffron: {
      beam: "bg-brand-saffron",
      glow: "shadow-[0_0_15px_rgba(255,153,51,0.8),0_0_30px_rgba(255,153,51,0.4)]",
      thumb: "bg-brand-saffron",
      thumbGlow: "shadow-[0_0_20px_rgba(255,153,51,1),0_0_40px_rgba(255,153,51,0.8)]"
    }
  };

  const activeColor = colorMap[color] || colorMap.blue;

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    updateValue(e.clientX);
    
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    updateValue(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const updateValue = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const rawPercentage = x / rect.width;
    const rawValue = rawPercentage * (max - min) + min;
    
    // Snap to step
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.min(Math.max(steppedValue, min), max);
    
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };

  return (
    <div 
      className={cn("relative h-8 flex items-center select-none cursor-pointer group", className)}
      ref={containerRef}
      onPointerDown={handlePointerDown}
    >
      {/* Background Track (Inactive Blade) */}
      <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm group-hover:bg-white/15 transition-colors">
        {/* Optional subtle grid/pattern inside track */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.5)_50%,transparent_100%)] w-full h-full" />
      </div>

      {/* Active Lightsaber Beam */}
      <motion.div
        className={cn("absolute h-1.5 rounded-full", activeColor.beam, activeColor.glow)}
        initial={false}
        animate={{ 
          width: `${percentage * 100}%`,
          boxShadow: isDragging 
            ? `0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)`
            : undefined
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Core of the beam (white hot center) */}
        <div className="absolute inset-x-0 top-[2px] bottom-[2px] bg-white/80 rounded-full blur-[1px]" />
      </motion.div>

      {/* Thumb (Starlight Node) */}
      <motion.div
        className="absolute w-6 h-6 -ml-3 flex items-center justify-center z-10"
        initial={false}
        animate={{ left: `${percentage * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className={cn("w-4 h-4 rounded-full bg-white relative", activeColor.thumbGlow)}
          animate={{
            scale: isDragging ? 1.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Starlight Pulse Animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Sparkles / Rays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
             <div className="w-[120%] h-[2px] bg-white/80 absolute rounded-full blur-[0.5px]" />
             <div className="h-[120%] w-[2px] bg-white/80 absolute rounded-full blur-[0.5px]" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
