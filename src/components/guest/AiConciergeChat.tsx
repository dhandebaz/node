"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

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
              className="relative flex items-center justify-center p-4 rounded-full bg-primary text-primary-foreground shadow-2xl overflow-hidden group"
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
            className="fixed bottom-6 right-6 md:right-10 z-50 w-[calc(100vw-3rem)] md:w-[400px] h-[550px] max-h-[calc(100vh-6rem)] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Host AI Concierge</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Available 24/7</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "")}>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white/5 text-zinc-300 border-white/10"
                    )}
                  >
                    {m.role === "user" ? (
                      <span className="text-[10px] font-black uppercase">You</span>
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-3 text-sm leading-relaxed max-w-[75%] rounded-2xl",
                      m.role === "user"
                        ? "bg-primary/20 text-white rounded-tr-sm border border-primary/30 text-right"
                        : "bg-white/5 text-zinc-200 rounded-tl-sm border border-white/5"
                    )}
                  >
                    {((m as any).content) || ((m as any).text)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim() || status !== "ready") return;
                  sendMessage({ text: chatInput });
                  setChatInput("");
                }} 
                className="relative flex items-center"
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Need something? Just ask..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoading}
                  className="absolute right-2 p-2 bg-white/10 rounded-xl text-white hover:bg-primary transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
