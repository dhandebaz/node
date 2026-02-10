"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { FailureRecord } from "@/types/failure";
import { AlertTriangle, XCircle, ShieldAlert, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFailureRecord extends FailureRecord {
  tenants: {
    name: string;
  };
}

export default function AdminFailuresPage() {
  const [failures, setFailures] = useState<AdminFailureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFailures = async () => {
    try {
      const data = await fetchWithAuth<{ failures: AdminFailureRecord[] }>("/api/admin/failures");
      setFailures(data.failures || []);
    } catch (err) {
      console.error("Failed to load failures", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFailures();
  }, []);

  const resolveFailure = async (id: string) => {
    // In a real app, we'd call an API to resolve. 
    // For now, let's just optimistically remove it or show a toast.
    // Ideally: await fetchWithAuth(`/api/admin/failures/${id}/resolve`, { method: 'POST' });
    alert("Resolution logic to be implemented via API");
  };

  if (loading) return <div>Loading failures...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Failures</h1>
        <button 
          onClick={loadFailures}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {failures.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-medium">All systems operational</h3>
          <p className="text-white/60">No active failures detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {failures.map((f) => (
            <div 
              key={f.id} 
              className={cn(
                "p-4 rounded-xl border flex items-start gap-4",
                f.severity === 'critical' ? "bg-red-500/10 border-red-500/20" :
                f.severity === 'warning' ? "bg-amber-500/10 border-amber-500/20" :
                "bg-blue-500/10 border-blue-500/20"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                f.severity === 'critical' ? "bg-red-500/20 text-red-200" :
                f.severity === 'warning' ? "bg-amber-500/20 text-amber-200" :
                "bg-blue-500/20 text-blue-200"
              )}>
                {f.severity === 'critical' ? <XCircle className="w-6 h-6" /> :
                 f.category === 'auth' ? <ShieldAlert className="w-6 h-6" /> :
                 <AlertTriangle className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{f.message}</h3>
                    <p className="text-sm text-white/60 mt-1">
                      {f.tenants?.name} • {f.category} • {f.source}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide",
                      f.severity === 'critical' ? "bg-red-500/20 text-red-200" :
                      f.severity === 'warning' ? "bg-amber-500/20 text-amber-200" :
                      "bg-blue-500/20 text-blue-200"
                    )}>
                      {f.severity}
                    </span>
                    <div className="text-xs text-white/40 mt-2">
                      {new Date(f.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <button 
                    onClick={() => resolveFailure(f.id)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
                  >
                    Mark Resolved
                  </button>
                  {/* Add specific actions based on category if needed */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
