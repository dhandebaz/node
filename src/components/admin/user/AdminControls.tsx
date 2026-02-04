
"use client";

import { useState } from "react";
import { User, AccountStatus, KYCStatus } from "@/types/user";
import { 
  updateUserStatusAction, 
  updateKYCStatusAction, 
  addNoteAction, 
  updateTagsAction 
} from "@/app/actions/user";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Plus, Tag } from "lucide-react";

interface AdminControlsProps {
  user: User;
}

export function AdminControls({ user }: AdminControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleStatusChange = async (newStatus: AccountStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setIsLoading(true);
    await updateUserStatusAction(user.identity.id, newStatus);
    setIsLoading(false);
  };

  const handleKYCChange = async (newStatus: KYCStatus) => {
    let reason = "";
    if (newStatus === "rejected") {
      const input = prompt("Please provide a reason for rejection:");
      if (input === null) return; // Cancelled
      reason = input;
    } else {
      if (!confirm(`Are you sure you want to change KYC status to ${newStatus}?`)) return;
    }

    setIsLoading(true);
    await updateKYCStatusAction(user.identity.id, newStatus, reason);
    setIsLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setIsLoading(true);
    await addNoteAction(user.identity.id, noteInput);
    setNoteInput("");
    setIsLoading(false);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    setIsLoading(true);
    const newTags = [...user.metadata.tags, tagInput.trim()];
    await updateTagsAction(user.identity.id, newTags);
    setTagInput("");
    setIsLoading(false);
  };

  const removeTag = async (tagToRemove: string) => {
    if (!confirm(`Remove tag "${tagToRemove}"?`)) return;
    setIsLoading(true);
    const newTags = user.metadata.tags.filter(t => t !== tagToRemove);
    await updateTagsAction(user.identity.id, newTags);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Account Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Account Status
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleStatusChange("active")}
            disabled={isLoading || user.status.account === "active"}
            className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
              user.status.account === "active"
                ? "bg-green-900/20 border-green-900 text-green-500 cursor-default"
                : "border-zinc-700 text-zinc-400 hover:border-green-800 hover:text-green-500"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusChange("suspended")}
            disabled={isLoading || user.status.account === "suspended"}
            className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
              user.status.account === "suspended"
                ? "bg-red-900/20 border-red-900 text-red-500 cursor-default"
                : "border-zinc-700 text-zinc-400 hover:border-red-800 hover:text-red-500"
            }`}
          >
            Suspend
          </button>
          <button
            onClick={() => handleStatusChange("blocked")}
            disabled={isLoading || user.status.account === "blocked"}
            className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
              user.status.account === "blocked"
                ? "bg-zinc-800 border-zinc-600 text-zinc-300 cursor-default"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            Block
          </button>
        </div>
      </div>

      {/* KYC Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          KYC Management
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2 text-sm text-zinc-400 bg-zinc-950 p-3 rounded border border-zinc-800 mb-2">
            Current Status: <span className="text-white uppercase font-bold">{user.status.kyc.replace("_", " ")}</span>
          </div>
          <button
            onClick={() => handleKYCChange("verified")}
            disabled={isLoading}
            className="py-2 rounded bg-green-900/20 text-green-400 border border-green-900 hover:bg-green-900/30 text-sm font-medium"
          >
            Approve KYC
          </button>
          <button
            onClick={() => handleKYCChange("rejected")}
            disabled={isLoading}
            className="py-2 rounded bg-red-900/20 text-red-400 border border-red-900 hover:bg-red-900/30 text-sm font-medium"
          >
            Reject KYC
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-500" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {user.metadata.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-sm border border-zinc-700">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-white">
                <XCircle className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add new tag..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !tagInput.trim()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded border border-zinc-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Internal Notes</h3>
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {user.metadata.notes.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No notes added yet.</p>
          ) : (
            user.metadata.notes.map((note, i) => (
              <div key={i} className="bg-zinc-950 p-3 rounded border border-zinc-800 text-sm text-zinc-300">
                {note}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleAddNote}>
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add a private note about this user..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue min-h-[80px] mb-2"
          />
          <button
            type="submit"
            disabled={isLoading || !noteInput.trim()}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded text-sm font-medium transition-colors"
          >
            Add Note
          </button>
        </form>
      </div>
    </div>
  );
}
