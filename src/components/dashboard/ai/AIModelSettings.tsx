
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Save, Loader2, Info } from "lucide-react";
import { updateAiSettingsAction } from "@/app/actions/customer";
import { toast } from "sonner";

interface AIModelSettingsProps {
  initialSettings?: {
    provider?: 'google' | 'anthropic' | 'openai';
    model?: string;
    apiKey?: string | null;
    customInstructions?: string | null;
    tone?: 'friendly' | 'professional' | 'concise' | 'humorous';
  };
}

export function AIModelSettings({ initialSettings }: AIModelSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    provider: initialSettings?.provider || "google",
    model: initialSettings?.model || "gemini-1.5-flash",
    apiKey: initialSettings?.apiKey || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // @ts-ignore - updateAiSettingsAction might need more fields but we are updating core ones
      await updateAiSettingsAction(settings);
      toast.success("AI model settings updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-white">AI Model & API Keys</CardTitle>
            <CardDescription className="text-white/50">
              Bring your own API key to use specific models or avoid usage limits.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white">Provider</Label>
            <Select 
              value={settings.provider} 
              onValueChange={(v: 'google' | 'anthropic' | 'openai') => setSettings({...settings, provider: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="google">Google Gemini</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="openai" disabled>OpenAI (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Model</Label>
            <Select 
              value={settings.model} 
              onValueChange={(v) => setSettings({...settings, model: v})}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {settings.provider === 'google' ? (
                  <>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">API Key</Label>
            <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
              <Info className="w-3 h-3" /> Encrypted at rest
            </span>
          </div>
          <Input 
            type="password"
            placeholder={settings.provider === 'google' ? "Enter Gemini API Key..." : "Enter Anthropic API Key..."}
            value={settings.apiKey}
            onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
            className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
          />
          <p className="text-[11px] text-white/30">
            If left blank, Nodebase will use system default keys and deduct credits from your wallet.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-white text-black hover:bg-zinc-200 font-bold px-6"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Config</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
