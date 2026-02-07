"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { NetworkBackground } from "@/components/ui/NetworkBackground";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-deep-red text-brand-bone flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-bone/20">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <NetworkBackground />
      </div>

      <div className="w-full max-w-md text-center relative z-10">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
          animate={{ rotate: 3, scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-brand-bone/10 rounded-3xl border border-brand-bone/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm"
        >
          <FileQuestion className="w-10 h-10 text-brand-bone" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4 tracking-tighter uppercase"
        >
          Page Not Found
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-brand-bone/60 mb-8 text-lg font-light"
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bone text-brand-deep-red font-bold rounded-full hover:bg-white transition-all uppercase tracking-wider text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
