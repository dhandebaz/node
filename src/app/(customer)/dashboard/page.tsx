export const dynamic = 'force-dynamic';


import { getCustomerProfile } from "@/app/actions/customer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Box, Server, ArrowRight } from "lucide-react";

export default async function CustomerDashboardPage() {
  const profile = await getCustomerProfile();
  const { isKaisaUser, isSpaceUser } = profile.roles;

  // If only one product, redirect
  if (isKaisaUser && !isSpaceUser) {
    redirect("/dashboard/kaisa");
  }
  if (isSpaceUser && !isKaisaUser) {
    redirect("/dashboard/space");
  }

  // If neither (shouldn't happen for valid users, but handle it)
  if (!isKaisaUser && !isSpaceUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h1 className="text-2xl font-bold text-white mb-2">No Active Products</h1>
        <p className="text-zinc-400 max-w-md">
          You don't have any active subscriptions. Please contact support or apply for a product.
        </p>
      </div>
    );
  }

  // Both products active
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-headline)] mb-2">Welcome back</h1>
        <p className="text-[var(--color-brand-muted)]">Select a workspace to continue.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nodebase Core Card */}
        <Link href="/dashboard/kaisa" className="group relative overflow-hidden bg-[rgba(22,7,10,0.6)] border border-[var(--color-brand-node-line)] rounded-2xl p-8 hover:border-[var(--color-brand-accent)] transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="w-32 h-32 text-[var(--color-brand-accent)]" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[var(--color-brand-accent)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-brand-accent)]">
              <Box className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-brand-headline)] mb-2">Nodebase Core</h2>
            <p className="text-[var(--color-brand-muted)] mb-6">
              Manage your AI workforce, view tasks, and configure modules for your business.
            </p>
            <div className="flex items-center text-[var(--color-brand-accent)] font-medium group-hover:gap-2 transition-all">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

        {/* Infrastructure Card */}
        <Link href="/dashboard/space" className="group relative overflow-hidden bg-[rgba(22,7,10,0.6)] border border-[var(--color-brand-node-line)] rounded-2xl p-8 hover:border-[var(--color-brand-muted)] transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="w-32 h-32 text-[var(--color-brand-muted)]" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[var(--color-brand-muted)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-brand-muted)]">
              <Server className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-brand-headline)] mb-2">Infrastructure</h2>
            <p className="text-[var(--color-brand-muted)] mb-6">
              Access your sovereign cloud infrastructure, manage domains, and monitor resources.
            </p>
            <div className="flex items-center text-[var(--color-brand-muted)] font-medium group-hover:gap-2 transition-all">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
