"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingRules {
  per_1k_tokens: number;
  action_multipliers: Record<string, number>;
  persona_multipliers: Record<string, number>;
}

export default function PricingRulesForm({ initialRules }: { initialRules: PricingRules }) {
  const [rules, setRules] = useState<PricingRules>(initialRules);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.refresh();
      alert("Pricing rules updated!");
    } catch (e) {
      alert("Error saving rules");
    } finally {
      setLoading(false);
    }
  };

  const updateMultiplier = (
    category: "action_multipliers" | "persona_multipliers",
    key: string,
    val: string
  ) => {
    setRules((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: parseFloat(val) || 0,
      },
    }));
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow border border-gray-200">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Base Token Pricing</h3>
        <div className="grid grid-cols-1 gap-4 max-w-xs">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost per 1k Tokens (Credits)</label>
            <input
              type="number"
              step="0.0001"
              value={rules.per_1k_tokens}
              onChange={(e) => setRules({ ...rules, per_1k_tokens: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              At 1 Credit = 1 INR, 0.002 means 500k tokens = 1 INR. (Adjust as needed)
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Action Multipliers</h3>
        <p className="text-sm text-gray-500 mb-4">Multiplier applied to base cost for specific actions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rules.action_multipliers).map(([key, val]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, " ")}</label>
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => updateMultiplier("action_multipliers", key, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Persona Multipliers</h3>
        <p className="text-sm text-gray-500 mb-4">Multiplier applied based on tenant business type.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rules.persona_multipliers || {}).map(([key, val]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, " ")}</label>
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => updateMultiplier("persona_multipliers", key, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
