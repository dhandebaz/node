
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNodeAction } from "@/app/actions/node";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNodeForm({ 
  users, 
  dcs 
}: { 
  users: { id: string; name: string }[], 
  dcs: { id: string; name: string; available: number }[] 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userId: "",
    dcId: "",
    pool: "Standard" as "Standard" | "High Performance" | "Storage Optimized",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.userId || !formData.dcId) {
      setError("Please select a user and a data center.");
      return;
    }

    setIsLoading(true);
    const result = await createNodeAction({
      userId: formData.userId,
      dcId: formData.dcId,
      pool: formData.pool,
    });

    if (result.success && result.node) {
      router.push(`/admin/nodes/${result.node.identity.id}`);
    } else {
      setError(result.error || "Failed to create node.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      
      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Participant (User)</label>
        <select
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-blue"
          disabled={isLoading}
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Data Center</label>
        <select
          value={formData.dcId}
          onChange={(e) => setFormData({ ...formData, dcId: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-blue"
          disabled={isLoading}
        >
          <option value="">Select Data Center</option>
          {dcs.map(dc => (
            <option key={dc.id} value={dc.id} disabled={dc.available <= 0}>
              {dc.name} ({dc.available} slots available)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Infrastructure Pool</label>
        <select
          value={formData.pool}
          onChange={(e) => setFormData({ ...formData, pool: e.target.value as any })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-blue"
          disabled={isLoading}
        >
          <option value="Standard">Standard</option>
          <option value="High Performance">High Performance</option>
          <option value="Storage Optimized">Storage Optimized</option>
        </select>
      </div>

      <div className="pt-4 flex items-center justify-end gap-4">
        <Link href="/admin/nodes" className="text-zinc-400 hover:text-white text-sm">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-blue text-white px-6 py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Node
        </button>
      </div>

    </form>
  );
}
