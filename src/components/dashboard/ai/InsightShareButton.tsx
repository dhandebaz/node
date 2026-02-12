"use client";

import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Check } from "lucide-react";
import { useState } from "react";

interface InsightShareButtonProps {
  stats?: {
    conversations: number;
    value: number;
    period: string; // 'week' | 'month'
  };
  text?: string;
  referralCode?: string;
}

export function InsightShareButton({ stats, text, referralCode }: InsightShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const shareText = text
    ? `${text}\n\nManaged by Nodebase AI.${referralCode ? ` Try it here: https://nodebase.ai/signup?ref=${referralCode}` : ''}`
    : stats
    ? `My AI Employee handled ${stats.conversations} conversations and generated ₹${stats.value.toLocaleString()} in value this ${stats.period}! 🚀\n\nManaged by Nodebase AI.${referralCode ? ` Try it here: https://nodebase.ai/signup?ref=${referralCode}` : ''}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleWhatsApp}
            className="text-green-500 border-green-500/20 hover:bg-green-500/10 hover:text-green-400 transition-colors"
        >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
        </Button>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="text-white/60 hover:text-white transition-colors"
        >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
        </Button>
    </div>
  );
}
