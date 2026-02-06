
"use client";

import { resetLearningAction } from "@/app/actions/kaisa-learning";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function ResetLearningButton() {
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm("Are you sure? This will delete ALL learned preferences, corrections, and patterns. This action cannot be undone.")) return;
    
    setLoading(true);
    try {
        await resetLearningAction();
    } catch (error) {
        console.error(error);
        alert("Failed to reset learning");
    } finally {
        setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleReset}
      disabled={loading}
      className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      Reset All Learning
    </button>
  );
}
