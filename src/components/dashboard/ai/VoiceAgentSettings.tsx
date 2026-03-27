
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Phone, Save, Loader2, Play, Pause, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { VoiceAgent } from "@/types/omnichannel";
import { fetchWithAuth } from "@/lib/api/fetcher";

interface VoiceAgentSettingsProps {
  tenantId: string;
}

export function VoiceAgentSettings({ tenantId }: VoiceAgentSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState<Partial<VoiceAgent> | null>(null);

  useEffect(() => {
    fetchAgent();
  }, [tenantId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/voice/agent?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data);
      }
    } catch (error) {
      console.error("Failed to fetch voice agent", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchWithAuth("/api/voice/agent", {
        method: "POST",
        body: JSON.stringify({ ...agent, tenantId }),
      });
      toast.success("Voice agent settings updated");
    } catch (error) {
      toast.error("Failed to save voice agent settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-foreground/40" /></div>;
  }

  return (
    <Card className="bg-transparent border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-foreground">Voice Employee (Beta)</CardTitle>
              <CardDescription className="text-foreground/50">
                Configure Kaisa to handle phone calls using VAPI or Retell.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="voice-active" className="text-xs text-foreground/50">Agent Status</Label>
            <Switch 
              id="voice-active"
              checked={agent?.status === 'active'} 
              onCheckedChange={(checked) => setAgent(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground">Provider</Label>
            <Select 
              value={agent?.provider || "vapi"} 
              onValueChange={(v: string) => setAgent(prev => ({ ...prev, provider: v as any }))}
            >
              <SelectTrigger className="bg-black/20 border-border text-foreground">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent className="public-panel border-border text-foreground">
                <SelectItem value="vapi">VAPI (Recommended)</SelectItem>
                <SelectItem value="retell">Retell AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Phone Number</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="+1 (555) 000-0000"
                value={agent?.phoneNumber || ""}
                onChange={(e) => setAgent(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="bg-black/20 border-border text-foreground"
              />
              <Button variant="outline" size="icon" className="border-border text-foreground hover:bg-white/5">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Voice Identity</Label>
          <Select 
            value={agent?.voiceId || "jennifer"} 
            onValueChange={(v: string) => setAgent(prev => ({ ...prev, voiceId: v }))}
          >
            <SelectTrigger className="bg-black/20 border-border text-foreground">
              <SelectValue placeholder="Select Voice" />
            </SelectTrigger>
            <SelectContent className="public-panel border-border text-foreground">
              <SelectItem value="jennifer">Jennifer (Professional)</SelectItem>
              <SelectItem value="mark">Mark (Helpful)</SelectItem>
              <SelectItem value="sarah">Sarah (Friendly)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Voice Instructions</Label>
          <textarea 
            placeholder="Tell Kaisa how to handle calls (e.g., 'Always be polite, check availability before confirming...')"
            value={agent?.instructions || ""}
            onChange={(e) => setAgent(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full min-h-[100px] bg-black/20 border-border rounded-md p-3 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Voice usage costs 5 credits/minute</span>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Voice Config</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
