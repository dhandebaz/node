
"use client";

import { useState } from "react";
import { User, AccountStatus, KYCStatus } from "@/types/user";
import { 
  updateUserStatusAction, 
  updateKYCStatusAction, 
  addNoteAction, 
  updateTagsAction 
} from "@/app/actions/user";
import { Loader2, AlertTriangle, CheckCircle, XCircle, Plus, Tag, FileText, ExternalLink, Eye, ShieldCheck } from "lucide-react";

interface AdminControlsProps {
  user: User;
}

export function AdminControls({ user }: AdminControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showDocuments, setShowDocuments] = useState(false);
  const [showVerificationReport, setShowVerificationReport] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

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

          <div className="col-span-2 flex gap-3 mb-2">
            <button 
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex-1 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm font-medium flex items-center justify-center gap-2"
            >
                <Eye className="w-4 h-4" />
                {showDocuments ? "Hide Documents" : "View Uploaded Documents"}
            </button>
            
            <button 
                onClick={() => setShowVerificationReport(!showVerificationReport)}
                className="flex-1 py-2 rounded border border-blue-900/50 text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 text-sm font-medium flex items-center justify-center gap-2"
            >
                <ShieldCheck className="w-4 h-4" />
                {showVerificationReport ? "Hide AI Report" : "kaisa AI Verification"}
            </button>
          </div>
          
          {showVerificationReport && (
             <div className="col-span-2 bg-blue-950/30 border border-blue-900/50 rounded p-4 mb-2">
                <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    kaisa AI Verification Report
                </h4>
                
                {(!user.status.kycDocuments || user.status.kycDocuments.length === 0) ? (
                    <p className="text-zinc-400 text-sm">No documents submitted for verification.</p>
                ) : (
                    <div className="space-y-4">
                        {user.status.kycDocuments.map((doc, idx) => (
                            <div key={idx} className="border-b border-blue-900/30 last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-zinc-300 font-medium text-sm">{doc.type} Verification</span>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${
                                        doc.verified 
                                            ? "bg-green-900/20 border-green-900 text-green-400" 
                                            : user.status.kyc === "rejected"
                                                ? "bg-red-900/20 border-red-900 text-red-400"
                                                : "bg-yellow-900/20 border-yellow-900 text-yellow-400"
                                    }`}>
                                        {doc.verified 
                                            ? "VERIFIED" 
                                            : user.status.kyc === "rejected" 
                                                ? "REJECTED" 
                                                : "PENDING REVIEW"
                                        }
                                    </span>
                                </div>
                                
                                {doc.verificationDetails ? (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Confidence Score</span>
                                            <span className={doc.verificationDetails.confidence > 0.8 ? "text-green-400" : "text-yellow-400"}>
                                                {Math.round(doc.verificationDetails.confidence * 100)}%
                                            </span>
                                        </div>
                                        {doc.verificationDetails.name && (
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Name Match</span>
                                                <span className="text-zinc-300">{doc.verificationDetails.name}</span>
                                            </div>
                                        )}
                                        {doc.verificationDetails.idNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">ID Number</span>
                                                <span className="text-zinc-300 font-mono">{doc.verificationDetails.idNumber}</span>
                                            </div>
                                        )}
                                         {doc.verificationDetails.reason && (
                                            <div className="col-span-2 mt-1 bg-red-900/10 border border-red-900/30 p-2 rounded">
                                                <span className="text-red-400 text-xs block font-bold mb-0.5">REJECTION REASON</span>
                                                <span className="text-red-300">{doc.verificationDetails.reason}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-xs italic">No AI details available for this document.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

          {showDocuments && user.status.kycDocuments && user.status.kycDocuments.length > 0 && (
            <div className="col-span-2 space-y-2 mb-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Submitted Documents</h4>
                {user.status.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-white font-medium text-sm">
                                <FileText className="w-4 h-4 text-zinc-400" />
                                {doc.type} Card
                            </div>
                            {doc.verificationDetails?.confidence && (
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded border ${
                                        doc.verified 
                                            ? "bg-green-900/20 border-green-900/50 text-green-400" 
                                            : user.status.kyc === "rejected"
                                                ? "bg-red-900/20 border-red-900/50 text-red-400"
                                                : "bg-yellow-900/20 border-yellow-900/50 text-yellow-400"
                                    }`}>
                                        AI Score: {Math.round(doc.verificationDetails.confidence * 100)}%
                                    </span>
                                    {doc.verified && <span className="text-xs text-zinc-500">Verified</span>}
                                </div>
                            )}
                            {doc.verificationDetails?.name && (
                                <div className="text-xs text-zinc-500 mt-1">Name: {doc.verificationDetails.name}</div>
                            )}
                        </div>
                        <button 
                            onClick={() => setSelectedDocument(doc.fileUrl)}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
          )}
          {showDocuments && (!user.status.kycDocuments || user.status.kycDocuments.length === 0) && (
             <div className="col-span-2 text-center py-4 text-zinc-500 text-sm bg-zinc-950 rounded border border-zinc-800 mb-2">
                 No documents uploaded by user.
             </div>
          )}

          {/* Document Preview Modal */}
          {selectedDocument && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDocument(null)}>
                <div className="relative bg-zinc-900 rounded-lg border border-zinc-800 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <h3 className="text-white font-medium">Document Preview</h3>
                        <button onClick={() => setSelectedDocument(null)} className="text-zinc-400 hover:text-white">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                        {/* In a real app, use Next.js Image with proper domains */}
                        <img 
                            src={selectedDocument} 
                            alt="Document Preview" 
                            className="max-w-full max-h-full object-contain rounded"
                        />
                    </div>
                </div>
            </div>
          )}

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
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white min-h-[80px] mb-2"
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
