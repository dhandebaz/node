
"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ProductType, KYCStatus, AccountStatus } from "@/types/user";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      router.push(`?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Phone, Email, or Tag..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-zinc-600"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors ${
            showFilters || Array.from(searchParams.keys()).some(k => k !== 'search') 
              ? "bg-zinc-800 border-zinc-700 text-white" 
              : "border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Product</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-white"
              value={searchParams.get("product") || ""}
              onChange={(e) => updateFilter("product", e.target.value || null)}
            >
              <option value="">All Products</option>
              <option value="kaisa">kaisa AI</option>
              <option value="space">Nodebase Space</option>
              <option value="node">Node Participant</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">KYC Status</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-white"
              value={searchParams.get("kycStatus") || ""}
              onChange={(e) => updateFilter("kycStatus", e.target.value || null)}
            >
              <option value="">All KYC Status</option>
              <option value="not_started">Not Started</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Account Status</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-white"
              value={searchParams.get("accountStatus") || ""}
              onChange={(e) => updateFilter("accountStatus", e.target.value || null)}
            >
              <option value="">All Account Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
