
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { NodeStatus, MoUStatus } from "@/types/node";

export function NodeFilters({ dcs }: { dcs: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex gap-4 mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          placeholder="Filter by User ID..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
          onChange={(e) => {
            router.push(`?${createQueryString("userId", e.target.value)}`);
          }}
          defaultValue={searchParams.get("userId")?.toString()}
        />
      </div>

      <select
        className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700"
        onChange={(e) => router.push(`?${createQueryString("dcId", e.target.value)}`)}
        defaultValue={searchParams.get("dcId")?.toString()}
      >
        <option value="">All Data Centers</option>
        {dcs.map(dc => (
          <option key={dc.id} value={dc.id}>{dc.name}</option>
        ))}
      </select>

      <select
        className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700"
        onChange={(e) => router.push(`?${createQueryString("status", e.target.value)}`)}
        defaultValue={searchParams.get("status")?.toString()}
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="deploying">Deploying</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="retired">Retired</option>
      </select>

      <select
        className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-700"
        onChange={(e) => router.push(`?${createQueryString("mouStatus", e.target.value)}`)}
        defaultValue={searchParams.get("mouStatus")?.toString()}
      >
        <option value="">All MoU Statuses</option>
        <option value="draft">Draft</option>
        <option value="signed">Signed</option>
        <option value="active">Active</option>
        <option value="terminated">Terminated</option>
        <option value="pending">Pending</option>
        <option value="not_signed">Not Signed</option>
      </select>
    </div>
  );
}
