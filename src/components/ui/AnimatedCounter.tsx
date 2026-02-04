"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion, MotionValue } from "framer-motion";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    // Set initial value immediately
    if (ref.current) {
      ref.current.textContent = `${value.toLocaleString()}${suffix}`;
    }
  }, []); // Run once on mount

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
