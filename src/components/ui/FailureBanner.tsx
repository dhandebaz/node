"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { FailureRecord } from "@/types/failure";
import { AlertTriangle, Info, ShieldAlert, XCircle, RefreshCw, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FailureBanner() {
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadFailures = async () => {
      try {
        const data = await fetchWithAuth<{ failures: FailureRecord[] }>("/api/failures");
        if (mounted) {
          setFailures(data.failures || []);
        }
      } catch (err) {
        console.error("Failed to load failures", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFailures();
    
    // Poll every 30 seconds for new failures
    const interval = setInterval(loadFailures, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading || failures.length === 0) return null;

  const getIcon = (severity: string, category: string) => {
    if (category === 'system') return AlertOctagon;
    if (severity === 'critical') return XCircle;
    if (category === 'auth' || category === 'payment') return ShieldAlert;
    if (category === 'integration') return RefreshCw;
    return AlertTriangle;
  };

  const getColor = (severity: string, category: string) => {
    if (category === 'system') return "bg-red-600 border-red-700 text-white shadow-lg shadow-red-500/20";
    if (severity === 'critical') return "bg-red-500/10 border-red-500/20 text-red-200";
    if (severity === 'warning') return "bg-amber-500/10 border-amber-500/20 text-amber-200";
    return "bg-blue-500/10 border-blue-500/20 text-blue-200";
  };

  const getAction = (f: FailureRecord) => {
    if (f.category === 'system') {
       return (
         <a href="mailto:support@nodebase.com" className="text-xs bg-white text-red-600 px-2 py-0.5 rounded font-bold ml-3 hover:bg-zinc-100">
           Contact Support
         </a>
       );
    }
    if (f.category === 'payment' && f.source === 'wallet') {
      return (
        <a href="/dashboard/wallet" className="text-xs font-semibold underline hover:no-underline ml-2">
          Top up wallet
        </a>
      );
    }
    if (f.category === 'integration') {
      return (
        <a href="/dashboard/integrations" className="text-xs font-semibold underline hover:no-underline ml-2">
          Check connection
        </a>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2 mb-6">
      {failures.map((f) => {
        const Icon = getIcon(f.severity, f.category);
        return (
          <div 
            key={f.id} 
            className={cn(
              "px-4 py-3 rounded-lg border flex items-start gap-3",
              getColor(f.severity, f.category)
            )}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center flex-wrap">
                {f.message}
                {getAction(f)}
              </div>
              <div className="text-xs opacity-70 mt-1 capitalize">
                {f.category} • {f.source}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
