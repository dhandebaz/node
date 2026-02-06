export const dynamic = 'force-dynamic';


import { getSupportTickets } from "@/app/actions/investor";
import { HelpCircle } from "lucide-react";
import { SupportTicketForm } from "@/components/investor/support/SupportTicketForm";

export const metadata = {
  title: "Support",
};

export default async function SupportPage() {
  const tickets = await getSupportTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-zinc-400" />
            Support & Help
          </h1>
          <p className="text-zinc-400 mt-1">
            Get assistance with your Node participation, reports, or documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                    <h3 className="font-bold text-white">Your Requests</h3>
                </div>
                {tickets.length > 0 ? (
                    <div className="divide-y divide-zinc-800">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-white">{ticket.subject}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                                        ticket.status === 'open' ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50' :
                                        ticket.status === 'closed' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                                        'bg-yellow-900/20 text-yellow-400 border border-yellow-900/50'
                                    }`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <span>ID: {ticket.id}</span>
                                    <span>Category: {ticket.category}</span>
                                    <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-zinc-500">
                        No support requests found.
                    </div>
                )}
            </div>
        </div>

        {/* New Ticket Form */}
        <div>
            <SupportTicketForm />
        </div>
      </div>
    </div>
  );
}
