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
    <div className="bg-card rounded-2xl p-6 border border-border shadow-xl relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Direct Payout Settings</h2>
            <p className="text-muted-foreground text-sm">Configure your UPI details for instant settlements</p>
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
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
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
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {errors.payeeName && (
              <p className="text-red-400 text-xs">{errors.payeeName.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
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
