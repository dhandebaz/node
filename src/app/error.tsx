'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { NetworkBackground } from '@/components/ui/NetworkBackground';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center relative overflow-hidden rounded-3xl bg-brand-deep-red text-brand-bone my-8 mx-4">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <NetworkBackground />
      </div>
      
      <div className="relative z-10 max-w-md w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-brand-bone/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-bone/20 backdrop-blur-sm"
        >
          <AlertTriangle className="w-10 h-10 text-brand-bone" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-4 uppercase tracking-tight"
        >
          Something went wrong!
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-brand-bone/70 text-lg font-light"
        >
          We apologize for the inconvenience. An unexpected error has occurred.
        </motion.p>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-bone text-brand-deep-red rounded-full hover:bg-white transition-all font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </motion.button>
      </div>
    </div>
  );
}
