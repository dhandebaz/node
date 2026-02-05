
"use client";

import { useState, useEffect } from "react";
import { Scan, Brain, CheckCircle, Terminal, ShieldCheck, Loader2 } from "lucide-react";

interface KaisaVerificationOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  documentType: "PAN" | "AADHAAR";
}

const LOG_STEPS = [
  "Initializing Kaisa Vision Model v2.4...",
  "Scanning document features & holograms...",
  "Validating ID checksum algorithms...",
  "Verification successful."
];

export function KaisaVerificationOverlay({ isVisible, onComplete, documentType }: KaisaVerificationOverlayProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setLogs([]);
      setCountdown(5);
      setIsScanning(true);
      return;
    }

    // Countdown Timer
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Log Simulation
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < LOG_STEPS.length) {
        setLogs((prev) => [...prev, `> ${LOG_STEPS[logIndex]}`]);
        logIndex++;
      } else {
        clearInterval(logInterval);
        setIsScanning(false);
        setTimeout(onComplete, 1000); // Wait a moment after logs finish before closing
      }
    }, 1000); // Speed up logs to fit ~5 seconds (1000ms * 4 = 4s)

    return () => {
      clearInterval(timerInterval);
      clearInterval(logInterval);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Animated Scanner Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-900/20 rounded-lg animate-pulse">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">KAISA AI</h3>
                <p className="text-xs text-cyan-400 font-mono">VISION ENGINE ACTIVE</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-white tabular-nums">
                00:0{countdown}
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Estimated Time</p>
            </div>
          </div>

          {/* Central Visualization */}
          <div className="relative h-48 bg-zinc-900/50 rounded-lg border border-zinc-800 mb-6 flex items-center justify-center overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
             
             {/* Scanning Animation */}
             <div className="relative z-10 flex flex-col items-center gap-4">
                {isScanning ? (
                    <>
                        <div className="relative">
                            <Scan className="w-16 h-16 text-cyan-500 animate-spin-slow" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        </div>
                        <div className="text-sm font-mono text-cyan-200 animate-pulse">
                            ANALYZING {documentType} STRUCTURE...
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-green-900/20 rounded-full border border-green-500/50 animate-bounce-slight">
                            <ShieldCheck className="w-16 h-16 text-green-400" />
                        </div>
                        <div className="text-lg font-bold text-green-400 tracking-widest uppercase">
                            VERIFIED
                        </div>
                    </>
                )}
             </div>
          </div>

          {/* Terminal Logs */}
          <div className="bg-black rounded-lg border border-zinc-800 p-4 h-48 overflow-y-auto font-mono text-xs custom-scrollbar">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 border-b border-zinc-900 pb-2">
                <Terminal className="w-3 h-3" />
                <span>SYSTEM LOGS</span>
            </div>
            <div className="space-y-1">
                {logs.map((log, index) => (
                    <div key={index} className="text-green-500/80">
                        {log}
                    </div>
                ))}
                {isScanning && (
                    <div className="w-2 h-4 bg-green-500 animate-blink inline-block ml-1" />
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-900 p-3 text-center text-xs text-zinc-600 border-t border-zinc-800 font-mono">
            SECURE ENCLAVE PROCESSING • END-TO-END ENCRYPTED
        </div>
      </div>
    </div>
  );
}
