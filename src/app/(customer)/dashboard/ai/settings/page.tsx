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
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter mb-2">
          Omni AI Control
        </h1>
        <p className="text-zinc-500 font-medium">
          Manage your AI Associate settings and how it interacts with {labels.customers.toLowerCase()}.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-white border-blue-100 shadow-xl shadow-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-zinc-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap
                  className={cn(
                    "w-5 h-5",
                    tenant?.is_ai_enabled
                      ? "text-blue-600"
                      : "text-zinc-400",
                  )}
                />
                <CardTitle className="text-zinc-950 font-black uppercase tracking-tight">
                  AI Activation
                </CardTitle>
              </div>
              <CardDescription className="text-zinc-500 font-medium">
                When active, Omni AI will automatically handle customer inquiries across all channels.
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

        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-zinc-950 font-black uppercase tracking-tight">
                    Tone of Voice
                  </CardTitle>
                  <CardDescription className="text-zinc-500 font-medium">
                    Set the persona of your AI associate.
                  </CardDescription>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest h-6 flex items-center justify-end sm:justify-start">
                {saveStatus === "saving" && (
                  <span className="text-blue-600 animate-pulse">Saving Changes...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-emerald-600">Settings Saved</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div
                onClick={() => setTone("professional")}
                className={cn(
                  "p-6 rounded-2xl border transition-all cursor-pointer",
                  tone === "professional"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-zinc-100 bg-zinc-50 hover:border-zinc-200",
                )}
              >
                <div className="font-black text-zinc-950 uppercase tracking-tight mb-2">
                  Institutional
                </div>
                <div className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Formal, respectful, and authoritative. Ideal for corporate clients and premium businesses.
                </div>
              </div>
              <div
                onClick={() => setTone("friendly")}
                className={cn(
                  "p-6 rounded-2xl border transition-all cursor-pointer",
                  tone === "friendly"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-zinc-100 bg-zinc-50 hover:border-zinc-200",
                )}
              >
                <div
                  className={cn(
                    "font-black uppercase tracking-tight mb-2",
                    tone === "friendly"
                      ? "text-blue-600"
                      : "text-zinc-950",
                  )}
                >
                  Approachable
                </div>
                <div className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Casual, welcoming, and warm. Perfect for high-engagement B2C startups and retail.
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">
                Executive Instructions
              </Label>
              <Textarea
                placeholder="e.g. Always emphasize our 24/7 priority support and mention our commitment to security."
                value={customInstructions}
                onChange={(event) => setCustomInstructions(event.target.value)}
                className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-300 min-h-[120px] rounded-2xl focus:ring-blue-600/5 focus:bg-white transition-all font-medium"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-zinc-950 font-black uppercase tracking-tight">Governance & Permissions</CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  Define the operational boundaries for your AI staff.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="space-y-1">
                <Label className="text-sm font-black text-zinc-950 uppercase tracking-tight">
                  Automated Appointments
                </Label>
                <div className="text-xs text-zinc-500 font-medium">
                  Allow AI to confirm {labels.bookings.toLowerCase()}{" "}
                  instantly based on your availability.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="space-y-1">
                <Label className="text-sm font-black text-zinc-950 uppercase tracking-tight">Financial Exceptions</Label>
                <div className="text-xs text-zinc-500 font-medium">
                  Allow AI to process partial refunds or resolution credits.
                </div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="space-y-1">
                <Label className="text-sm font-black text-zinc-950 uppercase tracking-tight">
                  Commercial Incentives
                </Label>
                <div className="text-xs text-zinc-500 font-medium">
                  Enable AI to offer dynamic discounts to high-intent leads.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-zinc-950 font-black uppercase tracking-tight">Institutional Knowledge</CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  Upload PDF, DOCX or TXT files to train Omni AI on your specific business logic.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
              <div className="text-zinc-400 font-black uppercase tracking-widest text-[10px] mb-2">
                Central Repository Empty
              </div>
              <div className="text-xs text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
                Connect your operating manuals, product guides, and FAQs to empower your AI Associate.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
