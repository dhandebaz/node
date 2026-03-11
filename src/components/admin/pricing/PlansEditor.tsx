"use client";

import { useState } from "react";
import { BillingPlan } from "@/types/billing";
import { updatePlanAction, createPlanAction } from "@/app/actions/admin";
import { Edit2, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PlansEditor({ plans: initialPlans }: { plans: BillingPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<BillingPlan>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (plan: BillingPlan) => {
    setEditingId(plan.id);
    setFormData(plan);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "INR",
      interval: "month",
      product: "kaisa",
      features: [],
      type: "subscription"
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined) {
      toast.error("Name and Price are required");
      return;
    }

    try {
      setSaving(true);
      if (isCreating) {
        await createPlanAction(formData as BillingPlan);
        toast.success("Plan created");
      } else if (editingId) {
        await updatePlanAction(editingId, formData);
        toast.success("Plan updated");
      }
      // In real app, we'd reload data or update local state from response
      // For now, reload page
      window.location.reload();
    } catch (e: any) {
      toast.error("Failed to save plan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  return (
    <div className="space-y-4">
      {/* Create Button */}
      {!isCreating && !editingId && (
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors text-sm mb-4"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      )}

      {/* Editor Form */}
      {(isCreating || editingId) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold text-white mb-4">{isCreating ? "New Plan" : "Edit Plan"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Name</label>
              <input 
                type="text" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Price (INR)</label>
              <input 
                type="number" 
                value={formData.price || 0} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1">Description</label>
              <input 
                type="text" 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Interval</label>
              <select 
                value={formData.interval || "month"} 
                onChange={e => setFormData({...formData, interval: e.target.value as any})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Product Family</label>
              <select 
                value={formData.product || "kaisa"} 
                onChange={e => setFormData({...formData, product: e.target.value as any})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
              >
                <option value="kaisa">Kaisa AI</option>
                <option value="space">Nodebase Space</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-white text-black rounded font-bold hover:bg-zinc-200 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save Plan
            </button>
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded font-bold hover:bg-zinc-700 text-sm flex items-center gap-2"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">{plan.name}</h3>
              <button 
                onClick={() => handleEdit(plan)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              ₹{plan.price} <span className="text-sm text-zinc-500 font-sans">/ {plan.interval}</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4 h-10 line-clamp-2">{plan.description}</p>
            
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                plan.product === 'kaisa' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
              }`}>
                {plan.product}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {plan.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
