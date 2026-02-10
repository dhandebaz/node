"use client";

import { useState, useTransition } from "react";
import { toggleBrandingAction } from "@/app/actions/ai-branding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

interface AIBrandingSettingsProps {
  initialEnabled: boolean;
}

export function AIBrandingSettings({ initialEnabled }: AIBrandingSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    startTransition(async () => {
      try {
        await toggleBrandingAction(checked);
      } catch (error) {
        setIsEnabled(!checked);
        console.error("Failed to toggle branding", error);
      }
    });
  };

  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-white">Growth & Branding</CardTitle>
            <CardDescription className="text-white/50">
              Help Nodebase grow to keep your costs low.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Show "Powered by Nodebase"</Label>
            <div className="text-sm text-white/50">
              Add a small badge to guest messages and confirmations.
            </div>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle} 
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
