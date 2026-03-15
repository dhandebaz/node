"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: 50 }).map((_, i) => {
        const rotateDir = Math.random() > 0.5 ? 1 : -1;
        const drift = Math.random() * 10 - 5;
        const duration = Math.random() * 2 + 2;
        const isCircle = Math.random() > 0.5;

        return {
          id: i,
          x: Math.random() * 100, // percentage
          y: -10, // start above screen
          rotate: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 0.5,
          rotateDir,
          drift,
          duration,
          isCircle,
        };
      });
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: "-10vh",
            rotate: p.rotate,
            scale: p.scale,
          }}
          animate={{
            y: "110vh",
            rotate: p.rotate + 360 * p.rotateDir,
            x: `${p.x + p.drift}vw`, // drift
          }}
          transition={{
            duration: p.duration, // 2-4s fall time
            ease: "easeOut",
            delay: p.delay,
          }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
