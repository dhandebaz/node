"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type ModeOption = {
  id: string;
  name: string;
  description: string;
  warning?: string | null;
};

type ActionOption = {
  id: string;
  label: string;
  description: string;
  example: string;
  dangerous?: boolean;
};

type EscalationOption = {
  id: string;
  label: string;
  description: string;
};

type QuietHours = {
  timezone: string;
  businessHours: { start: string; end: string };
  quietHours: { start: string; end: string };
  days: string[];
};

type AISettings = {
  userId: string;
  aiManagerType: string;
  mode: string;
  allowedActions: string[];
  escalationRules: string[];
  quietHours: QuietHours;
  lockedActions?: string[];
};

type SettingsPayload = {
  settings: AISettings;
  modeOptions: ModeOption[];
  actionOptions: ActionOption[];
  escalationOptions: EscalationOption[];
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AiSettingsPage() {
  const [payload, setPayload] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/settings");
      if (!response.ok) {
        throw new Error("Unable to load AI settings.");
      }
      const data = await response.json();
      setPayload(data);
    } catch (err: any) {
      setError(err?.message || "Unable to load AI settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const settings = payload?.settings;
  const lockedActions = settings?.lockedActions || [];

  const enabledActionOptions = useMemo(() => {
    if (!payload || !settings) return [];
    return payload.actionOptions.filter((action) => settings.allowedActions.includes(action.id));
  }, [payload, settings]);

  const updateSettings = (updates: Partial<AISettings>) => {
    if (!payload || !settings) return;
    setPayload({
      ...payload,
      settings: {
        ...settings,
        ...updates
      }
    });
  };

  const toggleAction = (action: ActionOption) => {
    if (!settings) return;
    if (lockedActions.includes(action.id)) return;
    const currentlyEnabled = settings.allowedActions.includes(action.id);
    if (!currentlyEnabled && action.dangerous) {
      const confirmEnable = window.confirm("This action can trigger customer-facing operations. Enable anyway?");
      if (!confirmEnable) return;
    }
    const nextAllowed = currentlyEnabled
      ? settings.allowedActions.filter((id) => id !== action.id)
      : [...settings.allowedActions, action.id];
    updateSettings({ allowedActions: nextAllowed });
  };

  const toggleEscalation = (ruleId: string) => {
    if (!settings) return;
    const active = settings.escalationRules.includes(ruleId);
    const nextRules = active
      ? settings.escalationRules.filter((id) => id !== ruleId)
      : [...settings.escalationRules, ruleId];
    updateSettings({ escalationRules: nextRules });
  };

  const updateQuietHours = (updates: Partial<QuietHours>) => {
    if (!settings) return;
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        ...updates
      }
    });
  };

  const updateBusinessHours = (updates: Partial<QuietHours["businessHours"]>) => {
    if (!settings) return;
    updateQuietHours({
      businessHours: {
        ...settings.quietHours.businessHours,
        ...updates
      }
    });
  };

  const updateQuietHoursRange = (updates: Partial<QuietHours["quietHours"]>) => {
    if (!settings) return;
    updateQuietHours({
      quietHours: {
        ...settings.quietHours.quietHours,
        ...updates
      }
    });
  };

  const toggleDay = (day: string) => {
    if (!settings) return;
    const days = settings.quietHours.days.includes(day)
      ? settings.quietHours.days.filter((d) => d !== day)
      : [...settings.quietHours.days, day];
    updateQuietHours({ days });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setSaveMessage(null);
      const response = await fetch("/api/ai/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      if (!response.ok) {
        throw new Error("Unable to save AI settings.");
      }
      const data = await response.json();
      setPayload((prev) => (prev ? { ...prev, settings: data.settings } : prev));
      setSaveMessage("Settings saved.");
    } catch (err: any) {
      setSaveMessage(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading AI settings...
      </div>
    );
  }

  if (!payload || !settings || error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-300">
        {error || "Unable to load AI settings."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">AI Orchestration</h1>
        <p className="text-zinc-400">Control how your AI Manager behaves without touching prompts.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Mode</h2>
            <p className="text-sm text-zinc-400">Choose how the AI should operate day to day.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            Admin safety limits always apply
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {payload.modeOptions.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateSettings({ mode: mode.id })}
              className={cn(
                "text-left p-4 rounded-xl border transition-colors",
                settings.mode === mode.id
                  ? "border-white bg-white/5"
                  : "border-zinc-800 hover:border-zinc-600"
              )}
            >
              <div className="text-sm font-semibold text-white">{mode.name}</div>
              <p className="text-xs text-zinc-400 mt-2">{mode.description}</p>
              {mode.warning && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span>{mode.warning}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Action Permissions</h2>
          <p className="text-sm text-zinc-400">Toggle what the AI can do. Disabled actions will never run.</p>
        </div>

        <div className="grid gap-4">
          {payload.actionOptions.map((action) => {
            const enabled = settings.allowedActions.includes(action.id);
            const locked = lockedActions.includes(action.id);
            return (
              <div
                key={action.id}
                className={cn(
                  "p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4",
                  enabled ? "border-white/20 bg-white/5" : "border-zinc-800"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white">{action.label}</div>
                    {locked && (
                      <span className="text-[10px] uppercase tracking-widest text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                        Admin locked
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-2">{action.description}</div>
                </div>
                <button
                  onClick={() => toggleAction(action)}
                  disabled={locked}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold border transition-colors",
                    enabled ? "border-white text-white" : "border-zinc-700 text-zinc-400",
                    locked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Escalation Rules</h2>
          <p className="text-sm text-zinc-400">Select when the AI must stop and ask you.</p>
        </div>
        <div className="grid gap-3">
          {payload.escalationOptions.map((rule) => {
            const active = settings.escalationRules.includes(rule.id);
            return (
              <button
                key={rule.id}
                onClick={() => toggleEscalation(rule.id)}
                className={cn(
                  "p-4 rounded-xl border text-left flex items-start justify-between gap-4",
                  active ? "border-white/20 bg-white/5" : "border-zinc-800"
                )}
              >
                <div>
                  <div className="text-sm font-semibold text-white">{rule.label}</div>
                  <div className="text-xs text-zinc-400 mt-2">{rule.description}</div>
                </div>
                {active && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Quiet Hours & Availability</h2>
          <p className="text-sm text-zinc-400">Prevent AI messages outside your business hours.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Business hours</div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.quietHours.businessHours.start}
                onChange={(event) => updateBusinessHours({ start: event.target.value })}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
              />
              <input
                type="time"
                value={settings.quietHours.businessHours.end}
                onChange={(event) => updateBusinessHours({ end: event.target.value })}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Quiet hours</div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.quietHours.quietHours.start}
                onChange={(event) => updateQuietHoursRange({ start: event.target.value })}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
              />
              <input
                type="time"
                value={settings.quietHours.quietHours.end}
                onChange={(event) => updateQuietHoursRange({ end: event.target.value })}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Timezone</div>
            <input
              type="text"
              value={settings.quietHours.timezone}
              readOnly
              className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white/70 cursor-not-allowed"
            />
            <div className="text-[11px] text-zinc-500">Emergency override can be enforced by admin.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border",
                settings.quietHours.days.includes(day)
                  ? "border-white text-white"
                  : "border-zinc-700 text-zinc-400"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Action Preview</h2>
          <p className="text-sm text-zinc-400">Examples of how enabled actions behave.</p>
        </div>
        {enabledActionOptions.length === 0 ? (
          <div className="text-sm text-zinc-500">Enable actions to see previews.</div>
        ) : (
          <div className="grid gap-4">
            {enabledActionOptions.map((action) => (
              <div key={action.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="text-sm font-semibold text-white">{action.label}</div>
                <div className="text-xs text-zinc-400 mt-2">{action.example}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">{saveMessage}</div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
