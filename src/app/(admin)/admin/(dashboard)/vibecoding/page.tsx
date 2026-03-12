"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Settings, Terminal, Server, Key, Cpu, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type AIProvider = 'google' | 'anthropic';
type AIModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';

const models: Record<AIProvider, AIModel[]> = {
  google: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
};

export default function VibecodingPage() {
  const [provider, setProvider] = useState<AIProvider>('google');
  const [model, setModel] = useState<AIModel>('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState("");
  const [useVPS, setUseVPS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [execLanguage, setExecLanguage] = useState<'javascript' | 'python' | 'bash'>('javascript');
  const [execCode, setExecCode] = useState('');
  const [execRunning, setExecRunning] = useState(false);
  const [execStdout, setExecStdout] = useState<string | null>(null);
  const [execStderr, setExecStderr] = useState<string | null>(null);
  const [execExitCode, setExecExitCode] = useState<number | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  const transport = new DefaultChatTransport({
    api: "/api/admin/vibecoding",
    body: {
      provider,
      model,
      apiKey: apiKey || undefined,
      useVPS,
    },
  });

  const { messages, status, sendMessage } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const runExecution = async () => {
    setExecError(null);
    setExecStdout(null);
    setExecStderr(null);
    setExecExitCode(null);
    if (!useVPS) {
      setExecError("Enable VPS Execution to run code.");
      return;
    }
    if (!execCode.trim()) {
      setExecError("Add some code to run.");
      return;
    }
    setExecRunning(true);
    try {
      const res = await fetch("/api/admin/vibecoding/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: execCode, language: execLanguage }),
      });
      const json = (await res.json()) as
        | { success: true; result: { stdout: string; stderr: string; exitCode: number } }
        | { error: string };
      if (!res.ok || "error" in json) {
        setExecError("error" in json ? json.error : "Execution failed");
        return;
      }
      setExecStdout(json.result.stdout || "");
      setExecStderr(json.result.stderr || "");
      setExecExitCode(json.result.exitCode);
    } catch (e) {
      setExecError(e instanceof Error ? e.message : "Execution failed");
    } finally {
      setExecRunning(false);
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-red" />
            Vibecoding
          </h1>
          <p className="text-zinc-400">AI-powered code generation & execution environment.</p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                    "p-2 rounded-lg transition-colors border",
                    showSettings 
                        ? "bg-zinc-800 text-white border-zinc-700" 
                        : "text-zinc-400 border-transparent hover:bg-zinc-900"
                )}
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </div>

      {showSettings && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Provider & Model</label>
                    <div className="flex gap-2">
                        <select 
                            value={provider}
                            onChange={(e) => {
                                const newProvider = e.target.value as AIProvider;
                                setProvider(newProvider);
                                setModel(models[newProvider][0]);
                            }}
                            className="bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-red outline-none"
                        >
                            <option value="google">Google Gemini</option>
                            <option value="anthropic">Anthropic Claude</option>
                        </select>
                        <select 
                            value={model}
                            onChange={(e) => setModel(e.target.value as AIModel)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-red outline-none"
                        >
                            {models[provider].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        API Key (Optional - BYOK)
                    </label>
                    <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${provider === 'google' ? 'Gemini' : 'Claude'} API Key`}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-red outline-none placeholder:text-zinc-700"
                    />
                    <p className="text-[10px] text-zinc-600">Leave empty to use system default keys.</p>
                </div>
            </div>

            <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        Execution Environment
                    </label>
                    <div 
                        onClick={() => setUseVPS(!useVPS)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                            useVPS 
                                ? "bg-blue-950/20 border-blue-900/50" 
                                : "bg-zinc-950 border-zinc-800"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", useVPS ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-zinc-700")} />
                            <div>
                                <div className={cn("text-sm font-medium", useVPS ? "text-blue-200" : "text-zinc-400")}>
                                    High-Performance VPS
                                </div>
                                <div className="text-xs text-zinc-600">
                                    Offload heavy computation to dedicated server
                                </div>
                            </div>
                        </div>
                        <div className={cn("text-xs font-bold px-2 py-1 rounded", useVPS ? "bg-blue-900/50 text-blue-300" : "bg-zinc-900 text-zinc-600")}>
                            {useVPS ? "ACTIVE" : "INACTIVE"}
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}

      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <div className="text-sm font-semibold text-white">Execution Runner</div>
          </div>
          <div className={cn("text-xs font-bold px-2 py-1 rounded", useVPS ? "bg-blue-900/50 text-blue-300" : "bg-zinc-900 text-zinc-600")}>
            {useVPS ? "VPS" : "DISABLED"}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={execLanguage}
              onChange={(e) => setExecLanguage(e.target.value as 'javascript' | 'python' | 'bash')}
              className="bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-red outline-none"
            >
              <option value="javascript">JavaScript (Node)</option>
              <option value="python">Python</option>
              <option value="bash">Bash</option>
            </select>
            <button
              type="button"
              onClick={runExecution}
              disabled={execRunning}
              className="ml-auto px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {execRunning ? "Running..." : "Run"}
            </button>
          </div>

          <textarea
            value={execCode}
            onChange={(e) => setExecCode(e.target.value)}
            placeholder="Paste code to execute on the VPS..."
            className="w-full min-h-[120px] bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-red/50 focus:border-brand-red/50 transition-all font-mono text-xs"
          />

          {(execError || execStdout || execStderr || execExitCode !== null) && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 space-y-2">
              {execError && <div className="text-sm text-red-300">{execError}</div>}
              {execExitCode !== null && (
                <div className="text-xs text-zinc-400">
                  Exit code: <span className="font-mono text-zinc-200">{execExitCode}</span>
                </div>
              )}
              {execStdout !== null && execStdout !== "" && (
                <pre className="text-xs text-zinc-200 whitespace-pre-wrap font-mono">{execStdout}</pre>
              )}
              {execStderr !== null && execStderr !== "" && (
                <pre className="text-xs text-amber-200 whitespace-pre-wrap font-mono">{execStderr}</pre>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col relative">
         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
                        <Terminal className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Ready to vibe. Select a model and start coding.</p>
                </div>
            )}
            
            {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-4 max-w-4xl mx-auto", m.role === 'user' ? "flex-row-reverse" : "")}>
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        m.role === 'user' ? "bg-white text-black" : "bg-brand-red text-white"
                    )}>
                        {m.role === 'user' ? <span className="font-bold text-xs">YOU</span> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === 'user' ? "bg-zinc-900 text-zinc-200" : "bg-transparent text-zinc-300"
                    )}>
                        {(m.parts || [])
                          .map((part) => (part.type === "text" ? part.text : ""))
                          .join("")}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                 <div className="flex gap-4 max-w-4xl mx-auto">
                    <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center shrink-0 animate-pulse">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 h-10">
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                    </div>
                </div>
            )}
         </div>

         {/* Input Area */}
         <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim() || status !== "ready") return;
                sendMessage({ text: chatInput });
                setChatInput("");
              }}
              className="max-w-4xl mx-auto relative"
            >
                <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe the functionality or ask a question..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-red/50 focus:border-brand-red/50 transition-all shadow-lg"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !chatInput.trim() || status !== "ready"}
                    className="absolute right-2 top-2 p-1.5 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
            <div className="text-center mt-2">
                 <p className="text-[10px] text-zinc-600">
                    Running on <span className="text-zinc-400 font-mono">{model}</span> via {provider} • {useVPS ? "VPS Execution Active" : "Local/Serverless Mode"}
                 </p>
            </div>
         </div>
      </div>
    </div>
  );
}
