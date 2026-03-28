"use client";

import { useState } from "react";
import { BillingPlan } from "@/types/billing";
import { updatePlanAction, createPlanAction } from "@/app/actions/admin";
import { Edit2, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
          className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all text-[11px] mb-6 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      )}

      {/* Editor Form */}
      {(isCreating || editingId) && (
        <div className="bg-muted/30 border border-border rounded-2xl p-8 mb-8 animate-in fade-in slide-in-from-top-4 shadow-inner">
          <h3 className="font-black uppercase tracking-widest text-foreground mb-6 text-sm">{isCreating ? "New Subscription Model" : "Edit Plan Configuration"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Plan Name</label>
              <input 
                type="text" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                placeholder="e.g. Enterprise Pro"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
                <input 
                  type="number" 
                  value={formData.price || 0} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</label>
              <input 
                type="text" 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Briefly describe what's included..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Billing Interval</label>
              <select 
                value={formData.interval || "month"} 
                onChange={e => setFormData({...formData, interval: e.target.value as any})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="month">Monthly Billing</option>
                <option value="year">Yearly Billing</option>
                <option value="one_time">One-Time Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Product Family</label>
              <select 
                value={formData.product || "kaisa"} 
                onChange={e => setFormData({...formData, product: e.target.value as any})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="kaisa">Kaisa AI Suite</option>
                <option value="space">Nodebase Space Content</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 md:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Apply Changes
            </button>
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-black uppercase tracking-widest hover:bg-muted/80 text-xs flex items-center gap-2 transition-all"
            >
              <X className="w-4 h-4" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="group bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="font-black uppercase tracking-tight text-foreground text-sm group-hover:text-primary transition-colors">{plan.name}</h3>
              <button 
                onClick={() => handleEdit(plan)}
                className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-3xl font-black text-foreground mb-2 flex items-baseline gap-1 relative z-10">
              <span className="text-sm font-mono text-muted-foreground mr-0.5">₹</span>
              {plan.price.toLocaleString()} 
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest ml-2">/ {plan.interval || 'month'}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6 h-10 line-clamp-2 font-medium leading-relaxed">{plan.description || "No description provided."}</p>
            
            <div className="flex items-center gap-2 relative z-10">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md border",
                plan.product === 'kaisa' ? "bg-primary/10 text-primary border-primary/20" : "bg-foreground/5 text-foreground/60 border-foreground/10"
              )}>
                {plan.product || 'unknown'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                {plan.type || 'subscription'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
