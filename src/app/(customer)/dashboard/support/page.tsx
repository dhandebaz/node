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
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <LifeBuoy className="w-8 h-8 text-primary" />
          Support Center
        </h1>
        <p className="text-muted-foreground">
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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Contact Us</h2>
          <div className="space-y-4">
            <a
              href="mailto:support@nodebase.space"
              className="flex items-center gap-4 p-4 bg-muted/50 text-foreground rounded-lg border border-border hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-card rounded-md text-primary group-hover:bg-muted/50">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Email Support</div>
                <div className="text-sm text-muted-foreground">
                  Response within 24 hours
                </div>
              </div>
            </a>
 
            <button className="w-full flex items-center gap-4 p-4 bg-muted/50 text-foreground rounded-lg border border-border hover:bg-muted transition-colors group text-left">
              <div className="p-2 bg-card rounded-md text-primary group-hover:bg-muted/50">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Live Chat</div>
                <div className="text-sm text-muted-foreground">
                  Available Mon-Fri, 9am-5pm EST
                </div>
              </div>
            </button>
 
            <a
              href="tel:+18005550123"
              className="flex items-center gap-4 p-4 bg-muted/50 text-foreground rounded-lg border border-border hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-card rounded-md text-primary group-hover:bg-muted/50">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Phone Support</div>
                <div className="text-sm text-muted-foreground">
                  Priority support for Pro plans
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Documentation
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 text-foreground rounded-lg border border-border">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Quick Start Guides
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Getting started with kaisa AI
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Deploying your first Space Cloud site
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Managing billing and invoices
                </li>
              </ul>
            </div>
 
            <div className="p-4 bg-muted/50 text-foreground rounded-lg border border-border">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                API Reference
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Authentication
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">
                  Endpoints
                </li>
                <li className="hover:text-primary cursor-pointer transition-colors">Webhooks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
