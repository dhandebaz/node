"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaAIDefaults } from "@/lib/business-context";
import { 
  Loader2,
  Brain,
  MessageSquare,
  Shield,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIMemorySettings } from "@/components/dashboard/ai/AIMemorySettings";

export default function AISettingsPage() {
  const { host } = useAuthStore();
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const aiDefaults = getPersonaAIDefaults(tenant?.businessType);

  if (!host) {
     return (
        <div className="flex items-center justify-center h-[50vh]">
           <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </div>
     );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Kaisa AI Settings</h1>
        <p className="text-white/60">Configure how your AI Employee interacts with {labels.customers.toLowerCase()}.</p>
      </div>

      <div className="grid gap-6">
        {/* Memory Settings */}
        <AIMemorySettings initialEnabled={tenant?.is_memory_enabled ?? false} />

        {/* Branding Settings */}
        <AIBrandingSettings initialEnabled={tenant?.is_branding_enabled ?? false} />

        {/* Tone of Voice */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">How should Kaisa AI talk to {labels.customers.toLowerCase()}?</CardTitle>
                <CardDescription className="text-white/50">Set the personality of your AI ({aiDefaults.role}).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-white/10 bg-black/20 hover:border-white/20 cursor-pointer transition-colors">
                    <div className="font-medium text-white mb-1">Professional & Polite</div>
                    <div className="text-sm text-white/50">Formal, respectful, and efficient. Best for business {labels.customers.toLowerCase()}.</div>
                </div>
                <div className="p-4 rounded-lg border border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 cursor-pointer transition-colors">
                    <div className="font-medium text-[var(--color-brand-red)] mb-1">Warm & Friendly (Active)</div>
                    <div className="text-sm text-white/50">Casual, welcoming, and helpful. Best for casual {labels.listings.toLowerCase()}.</div>
                </div>
            </div>
            <div className="pt-4">
                <Label className="text-white mb-2 block">Custom Instructions</Label>
                <Textarea 
                    placeholder="e.g. Always mention we have a friendly dog named Max."
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 min-h-[100px]"
                />
            </div>
          </CardContent>
        </Card>

        {/* Allowed Actions */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Allowed Actions</CardTitle>
                <CardDescription className="text-white/50">Control what your AI can and cannot do.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-white text-base">Accept {labels.bookings}</Label>
                    <div className="text-sm text-white/50">Allow AI to confirm {labels.bookings.toLowerCase()} automatically if criteria are met.</div>
                </div>
                <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-white text-base">Process Refunds</Label>
                    <div className="text-sm text-white/50">Allow AI to process refunds up to a certain limit.</div>
                </div>
                <Switch />
            </div>
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-white text-base">Send Special Offers</Label>
                    <div className="text-sm text-white/50">Allow AI to propose discounts to close a deal.</div>
                </div>
                <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Knowledge Base</CardTitle>
                <CardDescription className="text-white/50">Your AI learns from your {labels.listings.toLowerCase()}, but you can add general rules here.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                <div className="text-white/40 mb-2">No custom documents uploaded</div>
                <div className="text-sm text-white/30">Upload {labels.listing.toLowerCase()} rules, local guides, or FAQs.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
