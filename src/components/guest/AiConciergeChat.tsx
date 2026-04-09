"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function AiConciergeChat({ bookingId, propertyName }: { bookingId: string, propertyName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");

  const transport = new DefaultChatTransport({
    api: `/api/guide/${bookingId}/chat`,
  });

  const { messages, status, sendMessage } = useChat({
    transport,
  });

  const isLoading = (status as any) === "submitted" || (status as any) === "streaming" || (status as any) === "waiting";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    
    // In this specific version of useChat, we use sendMessage
    sendMessage({ text: chatInput });
    setChatInput("");
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center p-4 rounded-full bg-primary text-primary-foreground shadow-2xl overflow-hidden group border border-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-6 h-6 relative z-10 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 md:right-10 z-50 w-[calc(100vw-2rem)] md:w-[420px] h-[600px] max-h-[calc(100vh-6rem)] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.05] to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6 text-primary" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 shadow-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Concierge</h3>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">{propertyName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-none">
              {messages.length === 0 && (
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-5 py-4 text-sm leading-relaxed max-w-[85%] rounded-[1.5rem] bg-zinc-900/50 text-zinc-200 rounded-tl-md border border-white/[0.03] shadow-sm">
                    Hi! I'm your AI Concierge for {propertyName}. How can I help you today? You can ask me about Wi-Fi, property rules, or how to use the smart lock.
                  </div>
                </div>
              )}

              {messages.map((m: any) => (
                <div key={m.id} className={cn("flex gap-4 items-start", m.role === "user" ? "flex-row-reverse" : "")}>
                  <div
                    className={cn(
                      "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground border-primary/50"
                        : "bg-zinc-900 text-zinc-300 border-white/5"
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-5 py-4 text-sm leading-relaxed max-w-[85%] rounded-[1.5rem] shadow-sm",
                      m.role === "user"
                        ? "bg-primary/10 text-white rounded-tr-md border border-primary/20"
                        : "bg-zinc-900/50 text-zinc-200 rounded-tl-md border border-white/[0.03]"
                    )}
                  >
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                      <ReactMarkdown>
                        {m.content || m.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-5 py-4 rounded-[1.5rem] bg-zinc-900/30 border border-white/[0.03] rounded-tl-md flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 bg-gradient-to-t from-white/[0.02] to-transparent border-t border-white/5">
              <form 
                onSubmit={handleSubmit} 
                className="relative flex items-center group"
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Need something? Just ask..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] pl-6 pr-14 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoading}
                  className="absolute right-2.5 p-2.5 bg-primary text-primary-foreground rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

