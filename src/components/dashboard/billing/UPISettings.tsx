"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateHostUPIAction } from "@/app/actions/payments";
import { Loader2, Save, Wallet } from "lucide-react";

interface UPIFormValues {
  upiId: string;
  payeeName: string;
}

export function UPISettings() {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<UPIFormValues>({
    defaultValues: {
      upiId: "",
      payeeName: ""
    }
  });

  const onSubmit = async (data: UPIFormValues) => {
    try {
      setLoading(true);
      await updateHostUPIAction(data.upiId, data.payeeName);
      toast.success("UPI settings updated successfully");
    } catch (error) {
      toast.error("Failed to update UPI settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-[var(--public-line)] shadow-xl relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--public-ink)]">Direct Payout Settings</h2>
            <p className="text-[var(--public-muted)] text-sm">Configure your UPI details for instant settlements</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">UPI ID</label>
            <input
              {...register("upiId", { 
                required: "UPI ID is required",
                pattern: {
                  value: /^[\w.-]+@[\w.-]+$/,
                  message: "Invalid UPI ID format (e.g. name@bank)"
                }
              })}
              placeholder="e.g. 9876543210@ybl"
              className="w-full public-panel/50 border border-[var(--public-line)] rounded-lg px-4 py-2.5 text-[var(--public-ink)] placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            {errors.upiId && (
              <p className="text-red-400 text-xs">{errors.upiId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Payee Name</label>
            <input
              {...register("payeeName", { required: "Payee name is required" })}
              placeholder="Your business name"
              className="w-full public-panel/50 border border-[var(--public-line)] rounded-lg px-4 py-2.5 text-[var(--public-ink)] placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            {errors.payeeName && (
              <p className="text-red-400 text-xs">{errors.payeeName.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-[var(--public-ink)] px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
