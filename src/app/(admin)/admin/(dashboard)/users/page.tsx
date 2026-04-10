"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getUsersPageData } from "@/app/actions/admin-data";
import { UserFilters } from "@/components/admin/UserFilters";
import { AccountStatus, KYCStatus, ProductType } from "@/types/user";
import { MoreHorizontal, Loader2, UserPlus, Users as UsersIcon, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsersPageData>>>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || undefined;
  const product = searchParams.get("product") as ProductType || undefined;
  const kycStatus = searchParams.get("kycStatus") as KYCStatus || undefined;
  const accountStatus = searchParams.get("accountStatus") as AccountStatus || undefined;

  useEffect(() => {
    setLoading(true);
    const filters = {
      search,
      product,
      kycStatus,
      accountStatus,
    };
    getUsersPageData(filters).then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [search, product, kycStatus, accountStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Global <span className="text-primary/40">Registry</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Unified authority management & neural identity orchestration
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 group">
          <UserPlus className="w-4 h-4 transition-transform group-hover:rotate-12" />
          Authorize_Protocol_User
        </button>
      </div>

      <UserFilters />

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Active_Identity_Substrate</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Registry of all authenticated architectural nodes</p>
          </div>
          <Shield className="w-4 h-4 text-muted-foreground/20" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
              <tr>
                <th className="px-8 py-6">Identity_Hash</th>
                <th className="px-8 py-6">Authority_Context</th>
                <th className="px-8 py-6 text-center">Protocol_Access</th>
                <th className="px-8 py-6">Compliance</th>
                <th className="px-8 py-6">State_Status</th>
                <th className="px-8 py-6">Last_Pulse</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.identity.id} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-foreground font-black tracking-tighter text-[11px] group-hover/row:text-primary transition-colors">{user.identity.id.split("-")[0]}...</span>
                        <span className="text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest mt-1">{user.identity.phone}</span>
                        {user.identity.email && (
                          <span className="text-muted-foreground/20 text-[8px] font-medium tracking-tight mt-0.5">{user.identity.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.tenant ? (
                        <div className="flex flex-col">
                          <span className="text-foreground text-[10px] font-black uppercase tracking-tighter group-hover/row:translate-x-1 transition-transform">{user.tenant.name}</span>
                          <span className="text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{user.tenant.businessType}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/20 text-[9px] uppercase font-black tracking-[0.2em] italic">Independent_Node</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.roles.isOmniUser && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(214,0,28,0.1)]">OMNI_CORE</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <KYCBadge status={user.status.kyc} />
                    </td>
                    <td className="px-8 py-6">
                      <AccountBadge status={user.status.account} />
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 font-mono">
                      {new Date(user.metadata.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/admin/users/${user.identity.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/20 hover:bg-muted text-muted-foreground/40 hover:text-primary transition-all active:scale-90 border border-border/50 hover:border-primary/20 shadow-inner group"
                      >
                        <MoreHorizontal className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-zinc-500 px-2">
        <span>Showing {users.length} results</span>
        {/* Pagination would go here */}
      </div>
    </div>
  );
}

function KYCBadge({ status }: { status: KYCStatus }) {
  const styles: Record<KYCStatus, string> = {
    verified: "bg-success/10 text-success border-success/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]",
    pending: "bg-warning/10 text-warning border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    rejected: "bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]",
    not_started: "bg-muted text-muted-foreground/40 border-border opacity-50",
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-md text-[8px] font-black border uppercase tracking-[0.25em] transition-all",
      styles[status]
    )}>
      {status === 'not_started' ? "NO_DATA" : status.toUpperCase()}
    </span>
  );
}

function AccountBadge({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, string> = {
    active: "text-success font-black",
    suspended: "text-warning font-black",
    blocked: "text-destructive font-black opacity-80",
  };
  return (
    <span className={cn(
      "text-[9px] uppercase tracking-[0.3em] flex items-center gap-2",
      styles[status]
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full shadow-inner", status === 'active' ? "bg-success animate-pulse" : status === 'suspended' ? "bg-warning" : "bg-destructive")} />
      {status}
    </span>
  );
}
