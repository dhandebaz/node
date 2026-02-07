
"use client";

import { KaisaTask } from "@/types/kaisa";
import { updateKaisaTaskStatus } from "@/app/actions/kaisa";
import { Clock, Calendar, Play, CheckCircle } from "lucide-react";
import { useState } from "react";

export function TaskCard({ task }: { task: KaisaTask }) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateKaisaTaskStatus(task.id, newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card border border-[var(--color-brand-node-line)] rounded-xl p-5 hover:border-[var(--color-brand-accent)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          task.priority === "high" ? "bg-red-500/10 text-red-500" :
          task.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
          "bg-[var(--color-brand-node-dot)] text-[var(--color-brand-muted)]"
        }`}>
          {task.priority} Priority
        </span>
        <span className="text-xs text-[var(--color-brand-muted)]">{task.module}</span>
      </div>
      <h3 className="text-[var(--color-brand-headline)] font-medium mb-1">{task.title}</h3>
      <p className="text-sm text-[var(--color-brand-muted)] mb-4">{task.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)] border-t border-[var(--color-brand-node-line)] pt-3 mb-3">
        <Clock className="w-3 h-3" />
        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        {task.scheduledFor && (
            <span className="flex items-center gap-1 ml-auto text-[var(--color-brand-accent)]">
                <Calendar className="w-3 h-3" />
                Due {new Date(task.scheduledFor).toLocaleDateString()}
            </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {task.status === "queued" && (
          <button 
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent)]/80 text-[var(--color-brand-deep-red)] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            Start Task
          </button>
        )}
        {task.status === "in_progress" && (
          <button 
            onClick={() => handleStatusUpdate("completed")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-brand-body)] hover:bg-[var(--color-brand-body)]/80 text-[var(--color-brand-deep-red)] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-3 h-3" />
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
