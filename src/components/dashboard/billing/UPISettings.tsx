"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateHostUPIAction, uploadQRCodeAction } from "@/app/actions/payments";
import { Loader2, Save, Wallet, Upload, X } from "lucide-react";

interface UPIFormValues {
  upiId: string;
  payeeName: string;
  upiMobile: string;
}

interface UPISettingsProps {
  initialData?: {
    upiId?: string | null;
    payeeName?: string | null;
    upiMobile?: string | null;
    businessQrUrl?: string | null;
  };
}

export function UPISettings({ initialData }: UPISettingsProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(initialData?.businessQrUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<UPIFormValues>({
    defaultValues: {
      upiId: initialData?.upiId || "",
      payeeName: initialData?.payeeName || "",
      upiMobile: initialData?.upiMobile || ""
    }
  });

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingQR(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const qrUrl = await uploadQRCodeAction(base64);
        setQrPreview(qrUrl);
        toast.success("QR code uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload QR code");
      console.error(error);
    } finally {
      setUploadingQR(false);
    }
  };

  const onSubmit = async (data: UPIFormValues) => {
    try {
      setLoading(true);
      await updateHostUPIAction({
        upiId: data.upiId,
        payeeName: data.payeeName,
        upiMobile: data.upiMobile,
        businessQrUrl: qrPreview || undefined
      });
      toast.success("UPI settings updated successfully");
    } catch (error) {
      toast.error("Failed to update UPI settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeQR = () => {
    setQrPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-xl relative overflow-hidden">
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
          {/* QR Code Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">UPI QR Code</label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
              {qrPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={qrPreview} 
                    alt="UPI QR Code" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeQR}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleQRUpload}
                    className="hidden"
                    disabled={uploadingQR}
                  />
                  <div className="space-y-2">
                    {uploadingQR ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* UPI ID */}
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

          {/* UPI Mobile Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">UPI Mobile Number</label>
            <input
              {...register("upiMobile", {
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Invalid mobile number (10 digits)"
                }
              })}
              placeholder="e.g. 9876543210"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {errors.upiMobile && (
              <p className="text-red-400 text-xs">{errors.upiMobile.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional: For phone number based UPI payments
            </p>
          </div>

          {/* Payee Name */}
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
              disabled={loading || uploadingQR}
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
