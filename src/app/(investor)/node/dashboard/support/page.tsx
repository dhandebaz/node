
import { getSupportTickets, createSupportTicketAction } from "@/app/actions/investor";
import { HelpCircle, MessageSquare, Plus } from "lucide-react";

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
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-zinc-400" />
                    New Request
                </h3>
                
                <form action={createSupportTicketAction} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Category</label>
                        <select name="category" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors">
                            <option value="node">Node Operations</option>
                            <option value="reports">Reports & Data</option>
                            <option value="documents">Legal Documents</option>
                            <option value="other">Other Inquiry</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Subject</label>
                        <input name="subject" type="text" required placeholder="Brief summary of issue" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Message</label>
                        <textarea name="message" required rows={4} placeholder="Describe your request details..." className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"></textarea>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-2.5 bg-white text-black font-bold rounded text-sm hover:bg-zinc-200 transition-colors">
                            Submit Request
                        </button>
                    </div>
                    
                    <p className="text-xs text-zinc-500 text-center mt-4">
                        Standard response time: 24-48 hours. <br/>
                        For urgent operational issues, please check status page.
                    </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
