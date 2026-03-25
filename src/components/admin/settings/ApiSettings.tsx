"use client";

import { ApiSettings } from "@/types/settings";
import {
  updateApiSettingsAction,
  rotateApiKeysAction,
} from "@/app/actions/settings";
import { useState } from "react";
import { Server, RefreshCw, Radio, Key, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AI_PROVIDER_LABELS,
  getAIModelOptions,
  type AIModel,
  type AIProvider,
} from "@/lib/ai/config";

export function ApiSettingsPanel({ settings }: { settings: ApiSettings }) {
  const [loading, setLoading] = useState(false);
  const initialRuntimeProvider = settings.kaisaProvider || "google";
  const [runtimeProvider, setRuntimeProvider] = useState<AIProvider>(
    initialRuntimeProvider,
  );
  const [runtimeModel, setRuntimeModel] = useState<AIModel>(
    settings.kaisaModel || getAIModelOptions(initialRuntimeProvider)[0].id,
  );

  const handleToggle = async (key: keyof ApiSettings) => {
    // @ts-ignore
    const current = settings[key];
    setLoading(true);
    await updateApiSettingsAction({ [key]: !current });
    setLoading(false);
  };

  const handleRotation = async () => {
    if (
      !confirm(
        "CRITICAL: This will invalidate all current internal API keys immediately. Services using old keys will fail. Continue?",
      )
    )
      return;
    setLoading(true);
    await rotateApiKeysAction();
    setLoading(false);
  };

  const handleGeminiKeyUpdate = async (value: string) => {
    setLoading(true);
    await updateApiSettingsAction({ geminiApiKey: value });
    setLoading(false);
  };

  const handleRuntimeSave = async () => {
    setLoading(true);
    await updateApiSettingsAction({
      kaisaProvider: runtimeProvider,
      kaisaModel: runtimeModel,
    });
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm group">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
          <Server className="w-5 h-5 text-primary" />
        </div>
        Interconnect Protocols
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Internal API Access
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleToggle("publicApiEnabled")}
              disabled={loading}
              className={cn(
                "p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 active:scale-95 shadow-sm",
                settings.publicApiEnabled
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <Globe
                  className={`w-5 h-5 ${settings.publicApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}
                />
                <div className="text-left">
                  <div
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      settings.publicApiEnabled ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Public Protocol
                  </div>
                  <div className="text-xs text-zinc-500">
                    External developer access
                  </div>
                </div>
              </div>
              <div
                className={`text-xs font-bold ${settings.publicApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}
              >
                {settings.publicApiEnabled ? "ON" : "OFF"}
              </div>
            </button>

            <button
              onClick={() => handleToggle("partnerApiEnabled")}
              disabled={loading}
              className={cn(
                "p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 active:scale-95 shadow-sm",
                settings.partnerApiEnabled
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <Key
                  className={`w-5 h-5 ${settings.partnerApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}
                />
                <div className="text-left">
                  <div
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      settings.partnerApiEnabled ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Authority API
                  </div>
                  <div className="text-xs text-zinc-500">
                    B2B integration endpoints
                  </div>
                </div>
              </div>
              <div
                className={`text-xs font-bold ${settings.partnerApiEnabled ? "text-cyan-400" : "text-zinc-600"}`}
              >
                {settings.partnerApiEnabled ? "ON" : "OFF"}
              </div>
            </button>
          </div>

          <button
            onClick={() => handleToggle("webhookOutgoingEnabled")}
            disabled={loading}
            className={cn(
              "w-full p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 active:scale-[0.98] shadow-sm",
              settings.webhookOutgoingEnabled
                ? "bg-accent/10 border-accent/30"
                : "bg-muted/30 border-border"
            )}
          >
            <div className="flex items-center gap-3">
              <Radio
                className={`w-5 h-5 ${settings.webhookOutgoingEnabled ? "text-purple-400" : "text-zinc-600"}`}
              />
              <div className="text-left">
                <div
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    settings.webhookOutgoingEnabled ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  Signal Transmissions
                </div>
                <div className="text-xs text-zinc-500">
                  Global kill switch for all webhook events
                </div>
              </div>
            </div>
            <div
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                settings.webhookOutgoingEnabled ? "text-accent" : "text-muted-foreground/30"
              )}
            >
              {settings.webhookOutgoingEnabled ? "BROADCASTING" : "SILENCED"}
            </div>
          </button>
        </div>

          <h4 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-6 ml-2">
            Intelligence Engine Configuration
          </h4>
          <div className="p-8 bg-muted/20 border border-border rounded-2xl space-y-8 relative overflow-hidden group/ai">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/ai:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-2">
                  Kaisa Neural Runtime
                </label>
                <p className="text-xs text-zinc-500 mb-3">
                  Super admin only. This controls the model Kaisa uses across
                  business, customer, and public-facing AI flows.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={runtimeProvider}
                    onChange={(e) => {
                      const provider = e.target.value as AIProvider;
                      setRuntimeProvider(provider);
                      setRuntimeModel(getAIModelOptions(provider)[0].id);
                    }}
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  >
                    {Object.entries(AI_PROVIDER_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    value={runtimeModel}
                    onChange={(e) => setRuntimeModel(e.target.value as AIModel)}
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  >
                    {getAIModelOptions(runtimeProvider).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  {getAIModelOptions(runtimeProvider).find(
                    (model) => model.id === runtimeModel,
                  )?.description || "Active runtime for Kaisa AI."}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRuntimeSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 disabled:opacity-30"
                  >
                    Sync Intelligence Model
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-6 pt-8 border-t border-border/50">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 shadow-inner shrink-0">
                <Key className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-black uppercase tracking-widest text-foreground block mb-2">
                  Gemini Cryptic Key
                </label>
                <p className="text-xs text-zinc-500 mb-3">
                  Required for automated identity verification (KYC) processing.
                </p>
                <input
                  type="password"
                  placeholder="Insert encrypted signature..."
                  value={settings.geminiApiKey || ""}
                  onChange={(e) => handleGeminiKeyUpdate(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <h4 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-6 ml-2">
            Authority Rotation Ledger
          </h4>
          <div className="flex items-center justify-between p-6 bg-muted/10 border border-border rounded-2xl relative overflow-hidden group/rotation">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-border/50">
                <RefreshCw className={cn("w-6 h-6 text-foreground/40", loading ? "animate-spin" : "")} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-foreground mb-0.5">
                  Internal Core Secrets
                </div>
              <div className="text-xs text-zinc-500">
                Last rotation:{" "}
                {settings.rotationLastPerformed
                  ? new Date(settings.rotationLastPerformed).toLocaleString()
                  : "Never"}
              </div>
            </div>
            <button
              onClick={handleRotation}
              disabled={loading}
              className="px-6 py-2.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:opacity-90 active:scale-95 disabled:opacity-30"
            >
              Rotate Authority Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
