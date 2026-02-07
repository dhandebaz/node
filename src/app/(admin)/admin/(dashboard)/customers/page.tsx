"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type CustomerRow = {
  id: string;
  businessName: string;
  phone: string;
  aiManager: string | null;
  planPrice: number;
  walletBalance: number;
  status: string;
  createdAt: string | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Request failed");
  }
  return response.json();
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchJson<{ customers: CustomerRow[] }>("/api/admin/customers")
      .then((payload) => {
        setCustomers(payload.customers || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-zinc-400">Active businesses and their AI Manager status.</p>
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
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">AI Manager Hired</th>
                <th className="px-4 py-3">Plan Price</th>
                <th className="px-4 py-3">Wallet Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-white font-medium">{customer.businessName}</td>
                  <td className="px-4 py-3 text-zinc-400">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">{customer.aiManager || "—"}</td>
                  <td className="px-4 py-3">₹{new Intl.NumberFormat("en-IN").format(customer.planPrice || 0)}</td>
                  <td className="px-4 py-3">₹{new Intl.NumberFormat("en-IN").format(customer.walletBalance || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wider ${customer.status === "active" ? "bg-emerald-900/30 text-emerald-300 border-emerald-900" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${customer.id}`} className="text-xs text-white hover:text-blue-300">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-zinc-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
