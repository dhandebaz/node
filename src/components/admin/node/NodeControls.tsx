
"use client";

import { useState } from "react";
import { Node, NodeStatus, MoUStatus } from "@/types/node";
import { updateNodeStatusAction, updateMoUStatusAction, addNodeNoteAction } from "@/app/actions/node";
import { Loader2, Save, Plus, FileText, CheckCircle, PauseCircle, XCircle } from "lucide-react";

export function NodeControls({ node }: { node: Node }) {
  const [isLoading, setIsLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [mouRefInput, setMouRefInput] = useState(node.contract.mouRefId || "");

  const handleStatusChange = async (newStatus: NodeStatus) => {
    if (newStatus === node.state.status) return;
    
    // Custom confirmations based on transition
    let message = `Are you sure you want to change status to ${newStatus}?`;
    if (newStatus === "active") message += "\nThis will allocate a node slot in the Data Center.";
    if (newStatus === "retired") message += "\nThis will release the node slot from the Data Center.";
    
    if (!confirm(message)) return;

    setIsLoading(true);
    await updateNodeStatusAction(node.identity.id, newStatus);
    setIsLoading(false);
  };

  const handleMoUChange = async (newStatus: MoUStatus) => {
    if (newStatus === node.contract.mouStatus) return;
    if (!confirm(`Update MoU status to ${newStatus}?`)) return;

    setIsLoading(true);
    await updateMoUStatusAction(node.identity.id, newStatus, mouRefInput);
    setIsLoading(false);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setIsLoading(true);
    await addNodeNoteAction(node.identity.id, noteInput);
    setNoteInput("");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Operational State */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Operational State</h3>
        <div className="grid grid-cols-2 gap-2">
           {/* Status Buttons */}
           {(["pending", "deploying", "active", "paused", "retired"] as NodeStatus[]).map((status) => (
             <button
               key={status}
               onClick={() => handleStatusChange(status)}
               disabled={isLoading || node.state.status === status}
               className={`px-3 py-2 rounded text-xs uppercase font-bold border transition-colors flex items-center justify-center gap-2 ${
                 node.state.status === status
                   ? "bg-zinc-800 text-white border-zinc-600 cursor-default"
                   : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
               }`}
             >
                {status === "active" && <CheckCircle className="w-3 h-3" />}
                {status === "paused" && <PauseCircle className="w-3 h-3" />}
                {status === "retired" && <XCircle className="w-3 h-3" />}
               {status}
             </button>
           ))}
        </div>
        {node.state.holdPeriodEnd && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">Hold Period Ends</p>
                <p className="text-zinc-300 font-mono">{new Date(node.state.holdPeriodEnd).toLocaleDateString()}</p>
            </div>
        )}
      </div>

      {/* Contract Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Contract Management</h3>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-zinc-500 mb-1">MoU Reference ID</label>
                <input 
                    type="text" 
                    value={mouRefInput}
                    onChange={(e) => setMouRefInput(e.target.value)}
                    placeholder="e.g. MOU-2024-001"
                    className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full text-sm mb-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {(["draft", "signed", "active", "terminated", "pending", "not_signed"] as MoUStatus[]).map((status) => (
                    <button
                    key={status}
                    onClick={() => handleMoUChange(status)}
                    disabled={isLoading || node.contract.mouStatus === status}
                    className={`px-2 py-1.5 rounded text-xs uppercase font-medium border transition-colors ${
                        node.contract.mouStatus === status
                        ? "bg-blue-900/30 text-blue-400 border-blue-900 cursor-default"
                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                    >
                    {status}
                    </button>
                ))}
            </div>
            
            {node.contract.signedDate && (
                <p className="text-xs text-zinc-500 mt-2">
                    Signed on: <span className="text-zinc-300">{new Date(node.contract.signedDate).toLocaleDateString()}</span>
                </p>
            )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Admin Notes</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add note..."
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-white text-sm"
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
            {node.metadata.adminNotes.slice().reverse().map((note, i) => (
              <div key={i} className="p-3 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-400">
                {note}
              </div>
            ))}
            {node.metadata.adminNotes.length === 0 && <p className="text-xs text-zinc-600 text-center py-2">No notes added.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
