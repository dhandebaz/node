
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Save, Loader2, Sparkles, AlertCircle, Zap } from "lucide-react";
import { generatePriceSuggestionsAction } from "@/app/actions/revenue";
import { toast } from "sonner";

interface DynamicPricingCardProps {
  listingId: string;
  initialSettings?: any;
}

export function DynamicPricingCard({ listingId, initialSettings }: DynamicPricingCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState(initialSettings || {
    enabled: false,
    min_price: 0,
    max_price: 10000,
    strategy: "balanced",
    weekend_markup: 1.2,
    last_minute_discount: 0.8
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement updateListingSettings server action
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Pricing settings saved");
    } catch (error: any) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePriceSuggestionsAction(listingId);
      toast.success(`Generated ${result.count} new price suggestions!`);
    } catch (error: any) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-white text-base">AI Dynamic Pricing</CardTitle>
              <CardDescription className="text-white/50 text-xs">
                Kaisa will automatically suggest price changes based on demand.
              </CardDescription>
            </div>
          </div>
          <Switch 
            checked={settings.enabled} 
            onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white text-xs uppercase tracking-wider">Strategy</Label>
            <Select 
              value={settings.strategy} 
              onValueChange={(v: string) => setSettings({...settings, strategy: v})}
              disabled={!settings.enabled}
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select Strategy" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="aggressive">Aggressive (Max Occupancy)</SelectItem>
                <SelectItem value="balanced">Balanced (Revenue & Occupancy)</SelectItem>
                <SelectItem value="conservative">Conservative (Premium Rates)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-xs uppercase tracking-wider">Min / Max Nightly Rate</Label>
            <div className="flex gap-2">
              <Input 
                type="number"
                placeholder="Min"
                value={settings.min_price}
                onChange={(e) => setSettings({...settings, min_price: Number(e.target.value)})}
                className="bg-black/20 border-white/10 text-white"
                disabled={!settings.enabled}
              />
              <Input 
                type="number"
                placeholder="Max"
                value={settings.max_price}
                onChange={(e) => setSettings({...settings, max_price: Number(e.target.value)})}
                className="bg-black/20 border-white/10 text-white"
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3">
           <div className="flex items-center gap-2 text-emerald-400">
             <Sparkles className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-tight">AI Insights</span>
           </div>
           <p className="text-[11px] text-emerald-200/70 leading-relaxed">
             By enabling Dynamic Pricing, Kaisa can help increase your revenue by an average of 18% per month. 
             Suggestions will appear in your Revenue Dashboard for approval.
           </p>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={handleGenerate}
             disabled={!settings.enabled || isGenerating}
             className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[10px] font-bold h-8 uppercase tracking-widest"
           >
             {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
             Run Market Analysis Now
           </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-white text-black hover:bg-zinc-200 font-bold px-6"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Pricing Rules</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
