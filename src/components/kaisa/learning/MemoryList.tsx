
"use client";

import { KaisaMemory } from "@/types/kaisa-learning";
import { deleteMemoryAction, confirmInferenceAction, rejectInferenceAction } from "@/app/actions/kaisa-learning";
import { useState } from "react";
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BrainCircuit, 
  User, 
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";

export function MemoryList({ memories }: { memories: KaisaMemory[] }) {
  const [filter, setFilter] = useState<KaisaMemory['type'] | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMemories = memories.filter(m => filter === 'all' || m.type === filter);
  
  // Sort: Pending first, then newest
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (a.status === 'pending_confirmation' && b.status !== 'pending_confirmation') return -1;
    if (b.status === 'pending_confirmation' && a.status !== 'pending_confirmation') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function handleDelete(id: string) {
    if(!confirm("Are you sure you want to delete this memory? Your AI Employee will stop using this rule immediately.")) return;
    setDeletingId(id);
    await deleteMemoryAction(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'preference', 'process', 'correction', 'outcome'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filter === type 
                ? "bg-white text-black border-white" 
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {sortedMemories.length > 0 ? (
          sortedMemories.map((memory) => (
            <MemoryItem 
              key={memory.id} 
              memory={memory} 
              onDelete={handleDelete} 
              isDeleting={deletingId === memory.id}
            />
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-sm">No memories found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryItem({ 
  memory, 
  onDelete,
  isDeleting
}: { 
  memory: KaisaMemory, 
  onDelete: (id: string) => void,
  isDeleting: boolean
}) {
  const [loading, setLoading] = useState(false);

  const isPending = memory.status === 'pending_confirmation';
  
  const TypeIcon = {
    preference: User,
    process: FileText,
    correction: AlertTriangle,
    outcome: CheckCircle
  }[memory.type] || BrainCircuit;

  const handleConfirm = async () => {
    setLoading(true);
    await confirmInferenceAction(memory.id);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectInferenceAction(memory.id);
    setLoading(false);
  };

  return (
    <div className={`group relative bg-zinc-900 border rounded-xl p-5 transition-all ${
      isPending ? "border-blue-500/30 bg-blue-500/5" : "border-zinc-800 hover:border-zinc-700"
    }`}>
      {isPending && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-lg shadow-blue-500/20">
          Inferred Pattern
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${
          isPending ? "bg-blue-500/10 text-blue-400" : "bg-zinc-800 text-zinc-400"
        }`}>
          <TypeIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm leading-relaxed mb-1.5">
            {memory.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Learned {new Date(memory.createdAt).toLocaleDateString()}
            </span>
            {memory.moduleId && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {memory.moduleId}
              </span>
            )}
            {memory.source === 'inferred' && (
              <span className="flex items-center gap-1 text-blue-400/80">
                <BrainCircuit className="w-3 h-3" />
                {Math.round(memory.confidence * 100)}% Confidence
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <button 
                onClick={handleReject}
                disabled={loading}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Reject and Delete"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleConfirm}
                disabled={loading}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Confirm and Activate"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <button 
              onClick={() => onDelete(memory.id)}
              disabled={isDeleting}
              className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Forget this memory"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
