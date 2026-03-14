"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileCheck, CheckCircle2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { verifyCashfreeKYC, extractKycDataAction } from "@/app/actions/kyc";
import { useRouter } from "next/navigation";

export function KYCVerificationForm() {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pan || !aadhaar) {
      toast.error("Please enter both PAN and Aadhaar numbers");
      return;
    }

    setLoading(true);
    try {
      await verifyCashfreeKYC({ pan, aadhaar });
      toast.success("KYC Verified Successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image of your document");
      return;
    }

    setExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await extractKycDataAction(base64, file.type);
          
          if (result.success && result.details) {
            if (result.documentType === 'PAN') {
              setPan(result.details.idNumber || "");
              toast.success("PAN details extracted!");
            } else if (result.documentType === 'AADHAAR') {
              setAadhaar(result.details.idNumber || "");
              toast.success("Aadhaar details extracted!");
            }
          }
        } catch (e: any) {
          toast.error(e.message || "AI extraction failed");
        } finally {
          setExtracting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("Failed to read file");
      setExtracting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <FileCheck className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
            <p className="text-sm text-zinc-400">Identity verification status</p>
          </div>
        </div>
        
        <div className="hidden md:block">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            size="sm" 
            disabled={extracting}
            onClick={() => fileInputRef.current?.click()}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Auto-fill with AI
          </Button>
        </div>
      </div>
      <div className="p-6">
        <form onSubmit={handleVerify} className="space-y-4 max-w-md">
          <div className="md:hidden mb-4">
             <Button 
                type="button"
                variant="outline" 
                disabled={extracting}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {extracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Auto-fill from Photo
              </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">PAN Number</label>
            <Input
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Aadhaar Number</label>
            <Input
              placeholder="1234 5678 9012"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || extracting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Pay ₹11 & Verify Identity"
            )}
          </Button>
          
          <p className="text-xs text-zinc-500 text-center">
            ₹11 will be deducted from your wallet for verification.
          </p>
        </form>
      </div>
    </div>
  );
}
