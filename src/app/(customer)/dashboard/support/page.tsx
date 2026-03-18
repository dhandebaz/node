export const dynamic = "force-dynamic";

import { Mail, MessageSquare, FileText, Phone, LifeBuoy } from "lucide-react";
import { getCustomerTickets } from "@/app/actions/customer";
import { SupportTicketList } from "@/components/customer/SupportTicketList";
import { SystemHealthCheck } from "@/components/customer/SystemHealthCheck";
import { getCustomerProfile } from "@/app/actions/customer";
import { ControlService } from "@/lib/services/controlService";
import { WalletService } from "@/lib/services/walletService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ListingIntegration } from "@/types";

export default async function CustomerSupportPage() {
  const profile = await getCustomerProfile();
  const tickets = await getCustomerTickets();
  const flags = await ControlService.getSystemFlags();

  let walletBalance = 0;
  let integrations: ListingIntegration[] = [];

  if (profile.tenant) {
    // Fetch Wallet Balance
    walletBalance = await WalletService.getBalance(profile.tenant.id);

    // Fetch Integrations
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("listing_integrations")
      .select("*, listings!inner(tenant_id)")
      .eq("listings.tenant_id", profile.tenant.id);

    if (data) {
      integrations = data as unknown as ListingIntegration[];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--public-ink)] mb-2 flex items-center gap-3">
          <LifeBuoy className="w-8 h-8 text-brand-red" />
          Support Center
        </h1>
        <p className="text-[var(--public-muted)]">
          Get help with your products, account, and technical issues.
        </p>
      </div>

      {/* System Health Check (Failures & Status) */}
      {profile.tenant && (
        <SystemHealthCheck
          flags={flags}
          walletBalance={walletBalance}
          tenant={profile.tenant}
          integrations={integrations}
        />
      )}

      {/* Ticket System */}
      <SupportTicketList tickets={tickets} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="public-panel border border-[var(--public-line)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--public-ink)] mb-4">Contact Us</h2>
          <div className="space-y-4">
            <a
              href="mailto:support@nodebase.space"
              className="flex items-center gap-4 p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)] hover:bg-[var(--public-panel-muted)] transition-colors group"
            >
              <div className="p-2 public-panel rounded-md text-blue-500 group-hover:bg-[var(--public-bg-soft)] text-[var(--public-ink)]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-[var(--public-ink)]">Email Support</div>
                <div className="text-sm text-[var(--public-muted)]">
                  Response within 24 hours
                </div>
              </div>
            </a>

            <button className="w-full flex items-center gap-4 p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)] hover:bg-[var(--public-panel-muted)] transition-colors group text-left">
              <div className="p-2 public-panel rounded-md text-green-500 group-hover:bg-[var(--public-bg-soft)] text-[var(--public-ink)]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-[var(--public-ink)]">Live Chat</div>
                <div className="text-sm text-[var(--public-muted)]">
                  Available Mon-Fri, 9am-5pm EST
                </div>
              </div>
            </button>

            <a
              href="tel:+18005550123"
              className="flex items-center gap-4 p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)] hover:bg-[var(--public-panel-muted)] transition-colors group"
            >
              <div className="p-2 public-panel rounded-md text-purple-500 group-hover:bg-[var(--public-bg-soft)] text-[var(--public-ink)]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-[var(--public-ink)]">Phone Support</div>
                <div className="text-sm text-[var(--public-muted)]">
                  Priority support for Pro plans
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="public-panel border border-[var(--public-line)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--public-ink)] mb-4">
            Documentation
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
              <h3 className="font-medium text-[var(--public-ink)] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--public-muted)]" />
                Quick Start Guides
              </h3>
              <ul className="space-y-2 text-sm text-[var(--public-muted)]">
                <li className="hover:text-blue-400 cursor-pointer">
                  Getting started with kaisa AI
                </li>
                <li className="hover:text-blue-400 cursor-pointer">
                  Deploying your first Space Cloud site
                </li>
                <li className="hover:text-blue-400 cursor-pointer">
                  Managing billing and invoices
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[var(--public-bg-soft)] text-[var(--public-ink)] rounded-lg border border-[var(--public-line)]">
              <h3 className="font-medium text-[var(--public-ink)] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--public-muted)]" />
                API Reference
              </h3>
              <ul className="space-y-2 text-sm text-[var(--public-muted)]">
                <li className="hover:text-blue-400 cursor-pointer">
                  Authentication
                </li>
                <li className="hover:text-blue-400 cursor-pointer">
                  Endpoints
                </li>
                <li className="hover:text-blue-400 cursor-pointer">Webhooks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
