export const dynamic = 'force-dynamic';

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
      .from('listing_integrations')
      .select('*, listings!inner(tenant_id)')
      .eq('listings.tenant_id', profile.tenant.id);
      
    if (data) {
        integrations = data as unknown as ListingIntegration[];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <LifeBuoy className="w-8 h-8 text-brand-red" />
          Support Center
        </h1>
        <p className="text-zinc-400">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Us</h2>
          <div className="space-y-4">
            <a href="mailto:support@nodebase.com" className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors group">
              <div className="p-2 bg-zinc-900 rounded-md text-blue-500 group-hover:bg-zinc-950">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-white">Email Support</div>
                <div className="text-sm text-zinc-400">Response within 24 hours</div>
              </div>
            </a>
            
            <button className="w-full flex items-center gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors group text-left">
              <div className="p-2 bg-zinc-900 rounded-md text-green-500 group-hover:bg-zinc-950">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-white">Live Chat</div>
                <div className="text-sm text-zinc-400">Available Mon-Fri, 9am-5pm EST</div>
              </div>
            </button>
            
            <a href="tel:+18005550123" className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors group">
              <div className="p-2 bg-zinc-900 rounded-md text-purple-500 group-hover:bg-zinc-950">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-white">Phone Support</div>
                <div className="text-sm text-zinc-400">Priority support for Pro plans</div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Documentation</h2>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                Quick Start Guides
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="hover:text-blue-400 cursor-pointer">Getting started with kaisa AI</li>
                <li className="hover:text-blue-400 cursor-pointer">Deploying your first Space Cloud site</li>
                <li className="hover:text-blue-400 cursor-pointer">Managing billing and invoices</li>
              </ul>
            </div>

            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                API Reference
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="hover:text-blue-400 cursor-pointer">Authentication</li>
                <li className="hover:text-blue-400 cursor-pointer">Endpoints</li>
                <li className="hover:text-blue-400 cursor-pointer">Webhooks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
