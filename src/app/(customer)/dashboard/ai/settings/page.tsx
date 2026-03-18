"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  getBusinessLabels,
  getPersonaAIDefaults,
} from "@/lib/business-context";
import { Loader2, Brain, MessageSquare, Shield, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AIMemorySettings } from "@/components/dashboard/ai/AIMemorySettings";
import { AIBrandingSettings } from "@/components/dashboard/ai/AIBrandingSettings";
import { AIModelSettings } from "@/components/dashboard/ai/AIModelSettings";
import { VoiceAgentSettings } from "@/components/dashboard/ai/VoiceAgentSettings";
import { AIKnowledgeBase } from "@/components/dashboard/ai/AIKnowledgeBase";
import { updateAiSettingsAction } from "@/app/actions/customer";
import { toast } from "sonner";
import type { AITone } from "@/lib/ai/config";

export default function AISettingsPage() {
  const { host } = useAuthStore();
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const aiDefaults = getPersonaAIDefaults(tenant?.businessType);
  const [tone, setTone] = useState<AITone>("friendly");
  const [customInstructions, setCustomInstructions] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (tenant) {
      setTone(tenant.ai_settings?.tone || "friendly");
      setCustomInstructions(tenant.ai_settings?.customInstructions || "");
      setIsLoaded(true);
    }
  }, [tenant]);

  useEffect(() => {
    if (!isLoaded) return;

    if (
      tone === (tenant?.ai_settings?.tone || "friendly") &&
      customInstructions === (tenant?.ai_settings?.customInstructions || "")
    ) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await updateAiSettingsAction({ tone, customInstructions });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error: any) {
        toast.error(error?.message || "Failed to save settings");
        setSaveStatus("idle");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tone, customInstructions, isLoaded, tenant]);

  if (!host) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--public-ink)]/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-[var(--public-ink)] mb-2">
          Kaisa AI Settings
        </h1>
        <p className="text-[var(--public-ink)]/60">
          Configure how your AI Employee interacts with{" "}
          {labels.customers.toLowerCase()}.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Master AI Toggle */}
        <Card className="public-panel border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-[var(--public-line)]/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap
                  className={cn(
                    "w-5 h-5",
                    tenant?.is_ai_enabled
                      ? "text-emerald-500"
                      : "text-[var(--public-muted)]",
                  )}
                />
                <CardTitle className="text-[var(--public-ink)]">
                  AI Employee Activation
                </CardTitle>
              </div>
              <CardDescription className="text-[var(--public-muted)]">
                Switch your AI Employee on or off. When off, Kaisa will not
                reply to any customers.
              </CardDescription>
            </div>
            <Switch
              checked={tenant?.is_ai_enabled ?? false}
              onCheckedChange={async (checked) => {
                try {
                  const { toggleAiAction } =
                    await import("@/app/actions/ai-status");
                  await toggleAiAction(checked);
                } catch (e) {
                  console.error("Failed to toggle AI", e);
                }
              }}
            />
          </CardHeader>
        </Card>

        {/* AI Model & BYOK Settings */}
        <AIModelSettings />

        {/* Knowledge Base (RAG 2.0) */}
        <AIKnowledgeBase />

        {/* Voice Agent Settings */}
        <VoiceAgentSettings tenantId={tenant?.id || ""} />

        {/* Memory Settings */}
        <AIMemorySettings initialEnabled={tenant?.is_memory_enabled ?? false} />

        {/* Branding Settings */}
        <AIBrandingSettings
          initialEnabled={tenant?.is_branding_enabled ?? false}
        />

        {/* Tone of Voice */}
        <Card className="bg-[var(--color-dashboard-surface)] border-[var(--public-line)]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-[var(--public-ink)]">
                    How should Kaisa AI talk to {labels.customers.toLowerCase()}
                    ?
                  </CardTitle>
                  <CardDescription className="text-[var(--public-ink)]/50">
                    Set the personality of your AI ({aiDefaults.role}).
                  </CardDescription>
                </div>
              </div>
              <div className="text-xs font-medium h-6 flex items-center justify-end sm:justify-start">
                {saveStatus === "saving" && (
                  <span className="text-[var(--public-muted)] animate-pulse">Saving...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-emerald-400">Saved</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div
                onClick={() => setTone("professional")}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  tone === "professional"
                    ? "border-white/30 bg-white/5"
                    : "border-[var(--public-line)] bg-black/20 hover:border-white/20",
                )}
              >
                <div className="font-medium text-[var(--public-ink)] mb-1">
                  Professional & Polite
                </div>
                <div className="text-sm text-[var(--public-ink)]/50">
                  Formal, respectful, and efficient. Best for business{" "}
                  {labels.customers.toLowerCase()}.
                </div>
              </div>
              <div
                onClick={() => setTone("friendly")}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  tone === "friendly"
                    ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10"
                    : "border-[var(--public-line)] bg-black/20 hover:border-white/20",
                )}
              >
                <div
                  className={cn(
                    "font-medium mb-1",
                    tone === "friendly"
                      ? "text-[var(--color-brand-red)]"
                      : "text-[var(--public-ink)]",
                  )}
                >
                  Warm & Friendly
                </div>
                <div className="text-sm text-[var(--public-ink)]/50">
                  Casual, welcoming, and helpful. Best for casual{" "}
                  {labels.listings.toLowerCase()}.
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Label className="text-[var(--public-ink)] mb-2 block">
                Custom Instructions
              </Label>
              <Textarea
                placeholder="e.g. Always mention we have a friendly dog named Max."
                value={customInstructions}
                onChange={(event) => setCustomInstructions(event.target.value)}
                className="bg-black/20 border-[var(--public-line)] text-[var(--public-ink)] placeholder:text-[var(--public-ink)]/20 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Allowed Actions */}
        <Card className="bg-[var(--color-dashboard-surface)] border-[var(--public-line)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-[var(--public-ink)]">Allowed Actions</CardTitle>
                <CardDescription className="text-[var(--public-ink)]/50">
                  Control what your AI can and cannot do.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[var(--public-ink)] text-base">
                  Accept {labels.bookings}
                </Label>
                <div className="text-sm text-[var(--public-ink)]/50">
                  Allow AI to confirm {labels.bookings.toLowerCase()}{" "}
                  automatically if criteria are met.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[var(--public-ink)] text-base">Process Refunds</Label>
                <div className="text-sm text-[var(--public-ink)]/50">
                  Allow AI to process refunds up to a certain limit.
                </div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[var(--public-ink)] text-base">
                  Send Special Offers
                </Label>
                <div className="text-sm text-[var(--public-ink)]/50">
                  Allow AI to propose discounts to close a deal.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="bg-[var(--color-dashboard-surface)] border-[var(--public-line)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-[var(--public-ink)]">Knowledge Base</CardTitle>
                <CardDescription className="text-[var(--public-ink)]/50">
                  Your AI learns from your {labels.listings.toLowerCase()}, but
                  you can add general rules here.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 border-2 border-dashed border-[var(--public-line)] rounded-lg">
              <div className="text-[var(--public-ink)]/40 mb-2">
                No custom documents uploaded
              </div>
              <div className="text-sm text-[var(--public-ink)]/30">
                Upload {labels.listing.toLowerCase()} rules, local guides, or
                FAQs.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
