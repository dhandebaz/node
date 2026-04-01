"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, postWithAuth } from "@/lib/api/fetcher";
import Link from "next/link";
import { Building, Search, Filter, Users, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  username: string | null;
  phone: string | null;
  timezone: string;
  business_type: string | null;
  kyc_status: string;
  kyc_verified_at: string | null;
  created_at: string;
  is_ai_enabled: boolean;
  is_messaging_enabled: boolean;
  is_bookings_enabled: boolean;
  is_wallet_enabled: boolean;
  early_access: boolean;
  owner_email: string | null;
  owner_name: string | null;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kycStatus, setKycStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status,
        kyc_status: kycStatus,
      });
      if (search) params.set("search", search);

      const data = await fetchWithAuth<{ tenants: Tenant[]; total: number; pages: number }>(
        `/api/admin/tenants?${params}`
      );
      setTenants(data.tenants || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to load tenants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [page, status, kycStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTenants();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getKycBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case "verified":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20"><CheckCircle className="w-3 h-3" /> VERIFIED</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20"><Clock className="w-3 h-3" /> PENDING</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20"><XCircle className="w-3 h-3" /> REJECTED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted/30 text-muted-foreground border border-border"><Clock className="w-3 h-3" /> NOT_STARTED</span>;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Tenant <span className="text-primary/40">Registry</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Centralized tenant management &amp; KYC governance
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">{total} TENANTS</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-4 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value)}
          className="px-4 py-4 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50"
        >
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="not_started">Not Started</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={loadTenants}
          className="px-4 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Building className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-sm font-medium">No tenants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
                <tr>
                  <th className="px-8 py-6">Tenant</th>
                  <th className="px-8 py-6">Owner</th>
                  <th className="px-8 py-6">Business</th>
                  <th className="px-8 py-6">KYC Status</th>
                  <th className="px-8 py-6">Features</th>
                  <th className="px-8 py-6">Created</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                    <td className="px-8 py-6">
                      <div className="text-foreground font-black uppercase tracking-widest text-[10px] group-hover/row:text-primary transition-colors">
                        {tenant.name}
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/30 mt-1 uppercase tracking-tighter">
                        @{tenant.username || tenant.id.split("-")[0]}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-mono text-muted-foreground/60">
                        {tenant.owner_email || "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-foreground uppercase">
                      {tenant.business_type || "UNSET"}
                    </td>
                    <td className="px-8 py-6">
                      {getKycBadge(tenant.kyc_status)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1 flex-wrap">
                        {tenant.is_ai_enabled && <span className="w-2 h-2 rounded-full bg-success" title="AI" />}
                        {tenant.is_messaging_enabled && <span className="w-2 h-2 rounded-full bg-primary" title="Messaging" />}
                        {tenant.is_bookings_enabled && <span className="w-2 h-2 rounded-full bg-warning" title="Bookings" />}
                        {tenant.is_wallet_enabled && <span className="w-2 h-2 rounded-full bg-blue-500" title="Wallet" />}
                        {tenant.early_access && <span className="w-2 h-2 rounded-full bg-purple-500" title="Early Access" />}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-mono text-muted-foreground/40">
                      {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all group/btn"
                      >
                        MANAGE
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 border-t border-border">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-muted/30 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 bg-muted/30 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
