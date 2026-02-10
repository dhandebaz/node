"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface PricingRules {
  per_1k_tokens: number;
  action_multipliers: Record<string, number>;
  persona_multipliers?: Record<string, number>;
}

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pricing/settings")
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setRules(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!rules) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRules(data);
      alert("Pricing saved!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!rules) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Pricing Configuration</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Base Token Costs</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cost per 1,000 Tokens (Credits)</label>
            <input 
              type="number" 
              step="0.0001"
              value={rules.per_1k_tokens}
              onChange={(e) => setRules({...rules, per_1k_tokens: parseFloat(e.target.value)})}
              className="w-full border p-2 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Base cost for AI processing. Currently 1 Credit = 1 INR (approx).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Action Multipliers</h2>
          <p className="text-sm text-gray-500">Adjust cost weight for specific actions.</p>
          
          <div className="space-y-3">
            {Object.entries(rules.action_multipliers).map(([action, multiplier]) => (
              <div key={action} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="font-medium capitalize text-sm">{action.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">x</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => {
                      const newMultipliers = { ...rules.action_multipliers, [action]: parseFloat(e.target.value) };
                      setRules({ ...rules, action_multipliers: newMultipliers });
                    }}
                    className="w-20 border p-1 rounded text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Persona Multipliers</h2>
          <p className="text-sm text-gray-500">Adjust cost weight by business type.</p>
          
          <div className="space-y-3">
            {rules.persona_multipliers && Object.entries(rules.persona_multipliers).map(([persona, multiplier]) => (
              <div key={persona} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="font-medium capitalize text-sm">{persona.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">x</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => {
                      const newMultipliers = { ...rules.persona_multipliers!, [persona]: parseFloat(e.target.value) };
                      setRules({ ...rules, persona_multipliers: newMultipliers });
                    }}
                    className="w-20 border p-1 rounded text-right"
                  />
                </div>
              </div>
            ))}
            {!rules.persona_multipliers && <p className="text-sm text-gray-400">No persona multipliers defined.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
