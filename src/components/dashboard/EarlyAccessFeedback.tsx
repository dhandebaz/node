"use client";

import { useState } from "react";
import { MessageSquarePlus, X, Send } from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/feedback";

export function EarlyAccessFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    try {
        await submitFeedbackAction(feedback);
        setIsOpen(false);
        setFeedback("");
        alert("Thanks for your feedback! We're listening.");
    } catch (e) {
        console.error(e);
        alert("Something went wrong. Please try again.");
    } finally {
        setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 rounded-full shadow-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-3 flex items-center gap-2 md:bottom-8 transition-all duration-300 hover:scale-105"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="hidden md:inline">Beta Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Early Access Feedback</h2>
            <p className="text-sm text-white/60 mb-6">
              You're one of our first 100 users. Your feedback shapes Nodebase directly.
            </p>

            <textarea
              placeholder="Report a bug, request a feature, or just say hi..."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-4 min-h-[120px] text-white focus:outline-none focus:border-yellow-500/50 mb-6 resize-none placeholder:text-white/20"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setIsOpen(false)} 
                 className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSubmit} 
                 disabled={sending || !feedback.trim()} 
                 className="px-4 py-2 rounded-md bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {sending ? "Sending..." : <>Send Feedback <Send className="w-3 h-3" /></>}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
