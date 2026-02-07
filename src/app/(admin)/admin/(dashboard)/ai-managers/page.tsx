"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

type ManagerRow = {
  slug: string;
  name: string;
  status: "active" | "disabled";
  baseMonthlyPrice: number;
  updatedAt: string | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminAiManagersPage() {
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagerRow | null>(null);
  const [saving, setSaving] = useState(false);

  const loadManagers = () => {
    setLoading(true);
    fetchJson<{ managers: ManagerRow[] }>("/api/admin/ai-managers")
      .then((payload) => {
        setManagers(payload.managers || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const saveManager = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/ai-managers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selected.slug,
          baseMonthlyPrice: selected.baseMonthlyPrice,
          status: selected.status
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to save");
      }
      setSelected(null);
      loadManagers();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Managers</h1>
        <p className="text-zinc-400">Control availability and base pricing for each AI Manager.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-72">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="border border-zinc-800 rounded-lg overflow-auto bg-zinc-950/60">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Base Monthly Price</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {managers.map((manager) => (
                <tr key={manager.slug} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-white font-medium">{manager.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{manager.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider ${manager.status === "active" ? "bg-emerald-900/30 text-emerald-300 border-emerald-900" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                      {manager.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{new Intl.NumberFormat("en-IN").format(manager.baseMonthlyPrice)}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {manager.updatedAt ? new Date(manager.updatedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(manager)}
                      className="px-3 py-1 text-xs font-semibold border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    No AI Managers configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit AI Manager</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{selected.slug}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Name</label>
                <div className="mt-2 text-white font-medium">{selected.name}</div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Slug</label>
                <div className="mt-2 text-zinc-400">{selected.slug}</div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Base Monthly Price</label>
                <input
                  type="number"
                  className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                  value={selected.baseMonthlyPrice}
                  onChange={(e) => setSelected({ ...selected, baseMonthlyPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Status</label>
                <select
                  className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200"
                  value={selected.status}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value as "active" | "disabled" })}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <button
                onClick={saveManager}
                className="w-full px-4 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-zinc-200 transition-colors"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
