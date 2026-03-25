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
        <h2 className="text-lg font-semibold text-foreground">Your Tickets</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
            <Plus className="w-4 h-4" />
            New Ticket
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {tickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50 text-primary" />
                <p>No support tickets yet.</p>
            </div>
        ) : (
            <div className="divide-y divide-border">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 hover:bg-muted/50 transition-colors">
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
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="uppercase tracking-wider font-semibold opacity-60">{ticket.id}</span>
                            <span className="flex items-center gap-1">
                                Product: <span className="text-foreground capitalize font-medium">{ticket.product.replace('_', ' ')}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                Status: <span className="text-foreground capitalize font-medium">{ticket.status}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold text-foreground">Create Support Ticket</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                        <input 
                            name="subject"
                            required
                            type="text" 
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="Brief description of the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Product</label>
                        <select 
                            name="product"
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="ai_employee">AI Employee (Kaisa)</option>
                            <option value="general">General Support</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                        <select 
                            name="priority"
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="low">Low - General Question</option>
                            <option value="medium">Medium - Feature Issue</option>
                            <option value="high">High - System Down</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Message</label>
                        <textarea 
                            name="message"
                            required
                            rows={4}
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                            placeholder="Describe your issue in detail..."
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
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
