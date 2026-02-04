"use client";

import { motion } from "framer-motion";
import { Server, Database } from "lucide-react";

export function OpticalFiberAnimation() {
  // Define paths for the optical fibers
  // Path 1: Top Left to Bottom Center
  const path1 = "M 50 50 C 50 150, 200 150, 200 250";
  // Path 2: Bottom Center to Top Right
  const path2 = "M 200 250 C 200 150, 350 150, 350 50";
  // Path 3: Direct connection (Horizontal-ish curve)
  const path3 = "M 50 50 C 150 100, 250 0, 350 50";

  return (
    <div className="relative w-full h-[300px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
      {/* Background Grid/Terrain effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

      {/* SVG Layer for Cables and Packets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fiberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFC107" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FFC107" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFC107" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Underground Fibers (Static/Base) */}
        <path d={path1} stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
        <path d={path2} stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
        <path d={path3} stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />

        {/* Animated Light Pulses (The Fiber Optic Light) */}
        <motion.path
          d={path1}
          stroke="url(#fiberGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
          filter="url(#glow)"
        />
        <motion.path
          d={path2}
          stroke="url(#fiberGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1, repeatDelay: 0.5 }}
          filter="url(#glow)"
        />
         <motion.path
          d={path3}
          stroke="url(#fiberGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5, repeatDelay: 0.2 }}
          filter="url(#glow)"
        />

        {/* Data Packets (Super fast particles) */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`p1-${i}`}
            r="3"
            fill="#fff"
            filter="url(#glow)"
          >
            <animateMotion
              dur={`${1 + i * 0.5}s`}
              repeatCount="indefinite"
              path={path1}
              rotate="auto"
            />
          </motion.circle>
        ))}
        {[0, 1].map((i) => (
           <motion.circle
            key={`p2-${i}`}
            r="3"
            fill="#fff"
            filter="url(#glow)"
          >
            <animateMotion
              dur={`${0.8 + i * 0.6}s`}
              repeatCount="indefinite"
              path={path2}
              rotate="auto"
            />
          </motion.circle>
        ))}
         {[0, 1, 2, 3].map((i) => (
           <motion.circle
            key={`p3-${i}`}
            r="2"
            fill="#FFC107"
            filter="url(#glow)"
          >
            <animateMotion
              dur={`${0.6 + i * 0.4}s`}
              repeatCount="indefinite"
              path={path3}
              rotate="auto"
            />
          </motion.circle>
        ))}

        {/* Nodes / Data Centers Overlay - Embedded via foreignObject for perfect alignment */}
        
        {/* Node 1: Top Left (50, 50) */}
        <foreignObject x="0" y="0" width="100" height="120">
          <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
            <div className="w-12 h-12 bg-black border border-brand-saffron rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,193,7,0.3)] z-10">
              <Server className="w-6 h-6 text-brand-saffron" />
            </div>
            <div className="text-[10px] font-bold text-brand-saffron mt-2 bg-black/80 px-2 py-1 rounded backdrop-blur-sm">DC 1</div>
          </div>
        </foreignObject>

        {/* Node 2: Bottom Center (200, 250) */}
        <foreignObject x="150" y="200" width="100" height="120">
          <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
            <div className="w-16 h-16 bg-black border border-brand-saffron rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,193,7,0.3)] z-10">
              <Database className="w-8 h-8 text-brand-saffron" />
            </div>
            <div className="text-[10px] font-bold text-brand-saffron mt-2 bg-black/80 px-2 py-1 rounded backdrop-blur-sm">CORE HUB</div>
          </div>
        </foreignObject>

        {/* Node 3: Top Right (350, 50) */}
        <foreignObject x="300" y="0" width="100" height="120">
          <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
            <div className="w-12 h-12 bg-black border border-brand-saffron rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,193,7,0.3)] z-10">
              <Server className="w-6 h-6 text-brand-saffron" />
            </div>
            <div className="text-[10px] font-bold text-brand-saffron mt-2 bg-black/80 px-2 py-1 rounded backdrop-blur-sm">DC 2</div>
          </div>
        </foreignObject>
      </svg>
      
      {/* Overlay Text */}
      <div className="absolute bottom-4 right-4 text-xs text-white/30 italic max-w-[200px] text-right pointer-events-none">
        Simulated internal optical mesh
      </div>
    </div>
  );
}