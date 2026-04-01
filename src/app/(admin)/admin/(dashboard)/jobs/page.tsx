"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import { Clock, Play, Loader2, CheckCircle, XCircle, Calendar, Zap, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  name: string;
  description: string;
  schedule: string;
  category: string;
  status: string;
  last_run: string | null;
  next_run: string | null;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth<{ jobs: Job[] }>("/api/admin/jobs");
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to trigger this job now?")) {
      return;
    }

    setTriggering(jobId);
    try {
      await postWithAuth("/api/admin/jobs", { job_id: jobId });
      await loadJobs();
    } catch (err) {
      console.error("Failed to trigger job", err);
      alert("Failed to trigger job");
    } finally {
      setTriggering(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "integrations":
        return <Calendar className="w-4 h-4" />;
      case "messaging":
        return <Zap className="w-4 h-4" />;
      case "maintenance":
        return <Settings className="w-4 h-4" />;
      case "analytics":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">
            <CheckCircle className="w-3 h-3" /> COMPLETED
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted/30 text-muted-foreground border border-border">
            <Clock className="w-3 h-3" /> IDLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Scheduled <span className="text-primary/40">Jobs</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Background job monitoring &amp; manual trigger controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadJobs}
            className="px-4 py-3 bg-card border border-border rounded-2xl text-sm font-medium hover:bg-muted/30 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={cn(
                "p-6 rounded-2xl border transition-all group",
                job.status === "running"
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                  : "bg-card border-border hover:border-primary/40 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                    {getCategoryIcon(job.category)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-foreground">
                      {job.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {job.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 block">
                    Schedule
                  </label>
                  <p className="text-foreground font-mono text-xs">{job.schedule}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 block">
                    Category
                  </label>
                  <p className="text-foreground font-mono text-xs uppercase">{job.category}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 block">
                    Last Run
                  </label>
                  <p className="text-foreground font-mono text-xs">
                    {job.last_run ? new Date(job.last_run).toLocaleString() : "Never"}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 block">
                    Next Run
                  </label>
                  <p className="text-foreground font-mono text-xs">
                    {job.next_run ? new Date(job.next_run).toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => triggerJob(job.id)}
                disabled={triggering === job.id || job.status === "running"}
                className="w-full py-3 bg-muted/30 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {triggering === job.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    TRIGGERING...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    TRIGGER NOW
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
