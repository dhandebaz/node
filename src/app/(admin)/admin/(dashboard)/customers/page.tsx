import { getSupabaseServer } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

// Server Component
export default async function AdminCustomersPage() {
  const supabase = await getSupabaseServer();

  // Fetch Tenants (Customers) and billing plans in parallel
  const [tenantsResult, plansResult] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        `
          id,
          name,
          business_type,
          subscription_plan,
          subscription_status,
          created_at,
          tenant_users (
              user_id,
              role,
              users ( phone )
          ),
          wallets ( balance )
      `,
      )
      .order("created_at", { ascending: false }),
    supabase.from("billing_plans").select("id, name, price, interval, product"),
  ]);

  const { data: tenants, error } = tenantsResult;
  // Build a lookup map: plan_id -> price
  const planPriceMap: Record<string, number> = {};
  for (const plan of plansResult.data ?? []) {
    planPriceMap[plan.id] = Number(plan.price ?? 0);
  }

  if (error) {
    return (
      <div className="p-8 text-red-400">
        Error loading customers: {error.message}
      </div>
    );
  }

  const customers: CustomerRow[] = tenants.map((t: any) => {
    const owner = t.tenant_users.find((u: any) => u.role === "owner")?.users;
    const wallet = t.wallets?.[0];

    // Determine AI Manager from business type
    let aiManager: string | null = null;
    if (t.business_type === "doctor_clinic") aiManager = "Nurse AI";
    else if (t.business_type === "airbnb_host") aiManager = "Host AI";
    else if (t.business_type === "kirana_store") aiManager = "Dukan AI";

    // Resolve price from the billing_plans table; fall back to 0 if plan not found
    const planPrice = t.subscription_plan
      ? (planPriceMap[t.subscription_plan] ?? 0)
      : 0;

    return {
      id: t.id,
      businessName: t.name,
      phone: owner?.phone || " - ",
      aiManager,
      planPrice,
      walletBalance: wallet?.balance || 0,
      status: t.subscription_status || "active",
      createdAt: t.created_at,
    };
  });

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Market <span className="text-primary/40">Intelligence</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Active neural clusters and business authority management
          </p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">{customers.length} ACTIVE_CHANNELS</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em] border-b border-border">
                <tr>
                  <th className="px-8 py-6">Business_Unit</th>
                  <th className="px-8 py-6">Comm_Link</th>
                  <th className="px-8 py-6">Neural_Agent</th>
                  <th className="px-8 py-6">Asset_Value</th>
                  <th className="px-8 py-6">Wallet_Credit</th>
                  <th className="px-8 py-6">Status_Gate</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-all group/row border-b border-border/50 last:border-0 border-dashed">
                    <td className="px-8 py-6">
                      <div className="text-foreground font-black uppercase tracking-widest text-[10px] group-hover/row:text-primary transition-colors">
                        {customer.businessName}
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/30 mt-1 uppercase tracking-tighter">
                        ID: {customer.id.split("-")[0]}...
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-mono font-bold text-muted-foreground/60">
                      {customer.phone || " - "}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-accent/10 text-accent border border-accent/20">
                        {customer.aiManager || "UNASSIGNED"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-foreground">
                      ₹{new Intl.NumberFormat("en-IN").format(customer.planPrice || 0)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-bold text-foreground">₹{new Intl.NumberFormat("en-IN").format(customer.walletBalance || 0)}</div>
                      <div className="w-20 h-1 bg-muted rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-success/40" style={{ width: `${Math.min(100, (customer.walletBalance / 5000) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                          customer.status === "active" 
                            ? "bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
                            : "bg-muted text-muted-foreground/40 border-border"
                        )}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all group/btn"
                      >
                        MANAGE_ACCESS
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </Link>
                    </td>
                  </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
