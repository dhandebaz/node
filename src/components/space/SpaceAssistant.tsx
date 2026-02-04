
"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

export function SpaceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: "Hi! I'm the Space Cloud assistant. I can help you with DNS, deployments, or troubleshooting. How can I help?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const userQ = input;
    setInput("");

    // Mock AI response
    setTimeout(() => {
        let response = "I can help with that. Could you provide more details?";
        if (userQ.toLowerCase().includes("dns")) {
            response = "To update DNS, go to the 'Websites' tab, select your project, and look for the DNS Records section. You can add A, CNAME, or MX records there.";
        } else if (userQ.toLowerCase().includes("deploy")) {
            response = "Deployments are automated via Git. Push to your connected repository to trigger a new build.";
        } else if (userQ.toLowerCase().includes("ssl")) {
            response = "SSL certificates are automatically managed and renewed for all active domains on Space Cloud.";
        }
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-zinc-800 p-4 flex items-center justify-between border-b border-zinc-700">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Space Assistant</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-400">Online</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 h-64 sm:h-80">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-zinc-800 border-t border-zinc-700 flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hosting..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button 
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
            isOpen 
            ? 'bg-zinc-800 text-zinc-400 hover:text-white' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25'
        }`}
      >
        {isOpen ? (
            <>
                <span className="font-medium text-sm">Close Helper</span>
            </>
        ) : (
            <>
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium text-sm">Need Help?</span>
            </>
        )}
      </button>
    </div>
  );
}
