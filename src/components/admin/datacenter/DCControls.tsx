
"use client";

import { useState } from "react";
import { DataCenter, DCStatus } from "@/types/datacenter";
import { updateDCCapacityAction, updateDCStatusAction, addDCNoteAction } from "@/app/actions/datacenter";
import { Loader2, Save, AlertTriangle, Plus } from "lucide-react";

export function DCControls({ dc }: { dc: DataCenter }) {
  const [isLoading, setIsLoading] = useState(false);
  const [capacityInput, setCapacityInput] = useState(dc.capacity.total.toString());
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCapacityUpdate = async () => {
    const newTotal = parseInt(capacityInput);
    if (isNaN(newTotal)) return;
    
    if (newTotal < dc.capacity.active) {
      setError(`Capacity cannot be less than active nodes (${dc.capacity.active})`);
      return;
    }

    if (!confirm(`Are you sure you want to change total capacity from ${dc.capacity.total} to ${newTotal}?`)) return;

    setIsLoading(true);
    setError(null);
    const res = await updateDCCapacityAction(dc.id, newTotal);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to update capacity");
    }
  };

  const handleStatusChange = async (newStatus: DCStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setIsLoading(true);
    await updateDCStatusAction(dc.id, newStatus);
    setIsLoading(false);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setIsLoading(true);
    await addDCNoteAction(dc.id, noteInput);
    setNoteInput("");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Capacity Control */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Capacity Management</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Total Capacity (Node Slots)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={capacityInput}
                onChange={(e) => setCapacityInput(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-brand-blue"
              />
              <button 
                onClick={handleCapacityUpdate}
                disabled={isLoading || parseInt(capacityInput) === dc.capacity.total}
                className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <span className="block text-xs text-zinc-500">Active Nodes</span>
              <span className="text-zinc-300 font-mono text-lg">{dc.capacity.active}</span>
            </div>
            <div>
              <span className="block text-xs text-zinc-500">Available Slots</span>
              <span className={`font-mono text-lg ${
                (dc.capacity.total - dc.capacity.active) < 10 ? "text-red-400" : "text-green-400"
              }`}>
                {dc.capacity.total - dc.capacity.active}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Control */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Operational Status</h3>
        <div className="grid grid-cols-3 gap-2">
          {(["active", "planned", "retired"] as DCStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isLoading || dc.status === status}
              className={`px-3 py-2 rounded text-xs uppercase font-bold border transition-colors ${
                dc.status === status
                  ? "bg-zinc-800 text-white border-zinc-600 cursor-default"
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Operational Notes</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add incident or maintenance note..."
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-brand-blue text-sm"
            />
            <button 
              onClick={handleAddNote}
              disabled={isLoading || !noteInput.trim()}
              className="bg-zinc-800 text-white px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dc.notes.slice().reverse().map((note, i) => (
              <div key={i} className="p-3 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-400">
                {note}
              </div>
            ))}
            {dc.notes.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">No notes added.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
