"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ShieldCheck } from "lucide-react";

export function AIModelSettings() {
  return (
    <Card className="bg-[var(--color-dashboard-surface)] border-[var(--public-line)]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-[var(--public-ink)]">Kaisa AI Runtime</CardTitle>
            <CardDescription className="text-[var(--public-ink)]/50">
              Nodebase manages the Kaisa AI model stack centrally.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[var(--public-ink)]/70">
        <div className="rounded-2xl border border-[var(--public-line)] bg-black/20 p-4">
          Businesses cannot bring their own AI keys or switch providers and models.
          Kaisa runs on the Nodebase-managed runtime across dashboard, customer,
          and public-facing AI flows.
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-100">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <p>
            If the Kaisa runtime needs to change, Nodebase super admin controls
            it from platform settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
