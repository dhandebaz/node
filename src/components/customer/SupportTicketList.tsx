"use client";

import { useState } from "react";
import { SupportTicket } from "@/types/support";
import { createCustomerTicket } from "@/app/actions/customer";
import { MessageSquare, Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SupportTicketList({ tickets }: { tickets: SupportTicket[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
        await createCustomerTicket(formData);
        setIsModalOpen(false);
        router.refresh();
    } catch (error) {
        console.error(error);
        alert("Failed to create ticket");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Tickets</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
            <Plus className="w-4 h-4" />
            New Ticket
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {tickets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No support tickets yet.</p>
            </div>
        ) : (
            <div className="divide-y divide-zinc-800">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    ticket.status === 'open' ? 'bg-green-500' : 
                                    ticket.status === 'resolved' ? 'bg-zinc-500' : 'bg-yellow-500'
                                }`} />
                                <h3 className="font-medium text-white">{ticket.subject}</h3>
                            </div>
                            <span className="text-xs text-zinc-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                            <span className="uppercase tracking-wider">{ticket.id}</span>
                            <span className="flex items-center gap-1">
                                Product: <span className="text-zinc-300 capitalize">{ticket.product}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                Status: <span className="text-zinc-300 capitalize">{ticket.status}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <h3 className="font-semibold text-white">Create Support Ticket</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Subject</label>
                        <input 
                            name="subject"
                            required
                            type="text" 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Brief description of the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Product</label>
                        <select 
                            name="product"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="kaisa">Kaisa AI</option>
                            <option value="space">Nodebase Space</option>
                            <option value="node">Node Infrastructure</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
                        <select 
                            name="priority"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="low">Low - General Question</option>
                            <option value="medium">Medium - Feature Issue</option>
                            <option value="high">High - System Down</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                        <textarea 
                            name="message"
                            required
                            rows={4}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Describe your issue in detail..."
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
