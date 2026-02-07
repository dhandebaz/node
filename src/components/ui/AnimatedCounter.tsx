"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion, MotionValue } from "framer-motion";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20, duration: 2 });
  const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    // Start animation after mount
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${latest}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [displayValue, suffix]);

  return <span ref={ref} className="tabular-nums">{value.toLocaleString()}{suffix}</span>;
}
