"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const CloudTransition = ({ isTransitioning }: { isTransitioning: boolean }) => {
  if (!isTransitioning) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
      {/* Cloud 1 - Bottom Left */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "-20%", opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white/10 blur-[100px] rounded-full"
      />
      
      {/* Cloud 2 - Top Right */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: "20%", opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/20 blur-[80px] rounded-full"
      />

      {/* Cloud 3 - Center (Main Cover) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute w-[1000px] h-[1000px] bg-white/20 blur-[120px] rounded-full"
      />
      
      {/* Fog Layers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
    </div>
  );
};
