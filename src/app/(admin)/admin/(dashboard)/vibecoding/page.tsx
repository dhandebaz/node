"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Send,
  Settings,
  Terminal,
  Key,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCsrfToken } from "@/lib/api/csrf";
import {
  AI_PROVIDER_LABELS,
  getAIModelOptions,
  getProviderApiKeyPlaceholder,
  type AIModel,
  type AIProvider,
} from "@/lib/ai/config";

export default function VibecodingPage() {
  const [provider, setProvider] = useState<AIProvider>("google");
  const [model, setModel] = useState<AIModel>(
    getAIModelOptions("google")[0].id,
  );
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const csrf = getCsrfToken();
  const transport = new DefaultChatTransport({
    api: "/api/admin/vibecoding",
    headers: (csrf ? { "x-csrf-token": csrf } : undefined) as any,
    body: {
      provider,
      model,
      apiKey: apiKey || undefined,
    },
  });

  const { messages, status, sendMessage } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-foreground">
              Vibe<span className="text-primary/40">coding</span>
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Neural code orchestration & hybrid execution
          </p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 group border-2",
            showSettings 
              ? "bg-foreground text-background border-foreground shadow-[0_0_20px_rgba(0,0,0,0.1)]" 
              : "bg-background text-foreground border-border hover:border-primary/40 shadow-sm"
          )}
        >
          <Settings className={cn("w-4 h-4 transition-transform", showSettings ? "rotate-90" : "group-hover:rotate-12")} />
          Kernel_Config
        </button>
      </div>

      {showSettings && (
        <div className="bg-card border border-border rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm border-dashed">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                Llm_Substrate_Protocol
              </label>
              <div className="flex gap-4">
                <select
                  value={provider}
                  onChange={(e) => {
                    const newProvider = e.target.value as AIProvider;
                    setProvider(newProvider);
                    setModel(getAIModelOptions(newProvider)[0].id);
                  }}
                  className="bg-muted/50 border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  {Object.entries(AI_PROVIDER_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-card">
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as AIModel)}
                  className="flex-1 bg-muted/50 border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  {getAIModelOptions(provider).map((option) => (
                    <option key={option.id} value={option.id} className="bg-card">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                <Key className="w-3 h-3" />
                Identity_Auth_Token (BYOK_MODE)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={getProviderApiKeyPlaceholder(provider)}
                  className="w-full bg-muted/50 border border-border text-foreground text-xs font-mono rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none placeholder:text-muted-foreground/20 transition-all border-dashed"
                />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                Fallback to architectural defaults if nullified.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 items-stretch">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
          <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center border border-border/50">
                <Terminal className="w-4 h-4 text-foreground/40" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Neural_Interface</h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Llm_Socket_Ready</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 space-y-6 min-h-[300px]">
                <div className="w-20 h-20 rounded-[2.5rem] bg-muted/50 flex items-center justify-center border-2 border-dashed border-border group-hover:rotate-6 transition-transform">
                  <Bot className="w-10 h-10 opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Cognitive_Link_Idle</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Initiate architectural discourse...</p>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === "user" ? "flex-row-reverse" : "",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                    m.role === "user"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border",
                  )}
                >
                  {m.role === "user" ? (
                    <span className="font-black text-[10px] tracking-tight">YOU</span>
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-3xl px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] border shadow-sm",
                    m.role === "user"
                      ? "bg-muted/50 text-foreground border-border rounded-tr-none text-right"
                      : "bg-background text-foreground/80 border-border rounded-tl-none font-medium text-left",
                  )}
                >
                  {(m as any).content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-6 min-h-[100px]">
                <div className="w-10 h-10 rounded-2xl bg-background border border-border text-foreground flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 h-10">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-muted/20 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim() || status !== "ready") return;
                sendMessage({ text: chatInput });
                setChatInput("");
              }}
              className="relative group"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Architectural prompt interface..."
                className="w-full bg-background border-2 border-border rounded-2xl pl-6 pr-16 py-4 text-sm text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-xl shadow-foreground/[0.02]"
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim() || status !== "ready"}
                className="absolute right-3 top-3 p-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex justify-between items-center mt-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">
                Kernel: <span className="text-muted-foreground/40">{model}</span> • LOCAL_SUBSTRATE
              </p>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-50" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

