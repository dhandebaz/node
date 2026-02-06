
"use client";

import { useState } from "react";
import { addExplicitFeedbackAction } from "@/app/actions/kaisa-learning";
import { Loader2, Plus, MessageSquare, AlertCircle } from "lucide-react";

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await addExplicitFeedbackAction(formData);
    setLoading(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error || "Failed to add instruction");
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all group"
      >
        <div className="p-1 rounded-full bg-zinc-800 group-hover:bg-zinc-700">
          <Plus className="w-4 h-4" />
        </div>
        <span className="font-medium">Teach Kaisa something new</span>
      </button>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Add New Instruction
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Cancel
        </button>
      </div>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">What should Kaisa know?</label>
          <textarea 
            name="description"
            required
            placeholder="e.g., 'Always ask before refunding transactions over $50' or 'I prefer email summaries on Fridays'"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
            <select 
              name="type" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-zinc-700"
            >
              <option value="preference">Preference (My style)</option>
              <option value="process">Process (Business rule)</option>
              <option value="correction">Correction (Don't do this)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Module (Optional)</label>
            <select 
              name="moduleId" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-zinc-700"
            >
              <option value="">General / All</option>
              <option value="frontdesk">Frontdesk</option>
              <option value="billing">Billing</option>
              <option value="crm">CRM</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
           <div className="flex-1 flex items-start gap-2 text-xs text-zinc-500">
             <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
             <p>This will be active immediately. You can edit or delete it anytime.</p>
           </div>
           <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Save Instruction
          </button>
        </div>
      </form>
    </div>
  );
}
