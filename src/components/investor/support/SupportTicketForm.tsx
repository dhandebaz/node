"use client";

import { useState } from "react";
import { createSupportTicketAction } from "@/app/actions/investor";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function SupportTicketForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await createSupportTicketAction(formData);
      // Reset form
      (document.getElementById("support-form") as HTMLFormElement)?.reset();
      // Force refresh to show new ticket
      router.refresh(); 
      alert("Ticket created successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-zinc-400" />
            New Request
        </h3>
        
        <form id="support-form" action={handleSubmit} className="space-y-4">
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
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-2.5 bg-white text-black font-bold rounded text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Submitting..." : "Submit Request"}
                </button>
            </div>
            
            <p className="text-xs text-zinc-500 text-center mt-4">
                Standard response time: 24-48 hours. <br/>
                For urgent operational issues, please check status page.
            </p>
        </form>
    </div>
  );
}
