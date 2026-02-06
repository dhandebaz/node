
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          task.priority === "high" ? "bg-red-500/10 text-red-500" :
          task.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
          "bg-blue-500/10 text-blue-500"
        }`}>
          {task.priority} Priority
        </span>
        <span className="text-xs text-zinc-500">{task.module}</span>
      </div>
      <h3 className="text-white font-medium mb-1">{task.title}</h3>
      <p className="text-sm text-zinc-400 mb-4">{task.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-3 mb-3">
        <Clock className="w-3 h-3" />
        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        {task.scheduledFor && (
            <span className="flex items-center gap-1 ml-auto text-blue-400">
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
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            Start Task
          </button>
        )}
        {task.status === "in_progress" && (
          <button 
            onClick={() => handleStatusUpdate("completed")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-3 h-3" />
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
