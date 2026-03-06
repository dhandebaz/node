"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

const messages = [
  { role: "user", content: "Hi, do you have availability for next weekend?" },
  { role: "assistant", content: "Checking... Yes! The Sea View Suite is available for ₹4,500/night. Would you like to book it?" },
  { role: "user", content: "Yes please. Is breakfast included?" },
  { role: "assistant", content: "Absolutely! Complimentary breakfast is served from 7-10 AM. I'll send you the payment link now." }
];

export function MockChatInterface() {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200">
      {/* Header */}
      <div className="bg-zinc-50 p-4 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="ml-2 text-sm font-semibold text-zinc-600">Host AI</div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 bg-zinc-50/50 min-h-[300px]">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 1.5, duration: 0.5 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-deep-red text-white rounded-br-none"
                  : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {/* Typing Indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: messages.length * 1.5 + 0.5, repeat: Infinity, repeatType: "reverse", duration: 1 }}
            className="flex justify-start"
        >
             <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 rounded-bl-none shadow-sm flex gap-1">
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
             </div>
        </motion.div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-zinc-100">
        <div className="flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-2">
          <div className="flex-1 text-sm text-zinc-400">Type a message...</div>
          <div className="p-1.5 bg-brand-deep-red rounded-full text-white">
            <Send className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
