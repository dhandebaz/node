"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { verifyCashfreeKYC } from "@/app/actions/kyc";
import { useRouter } from "next/navigation";

export function KYCVerificationForm() {
  const [loading, setLoading] = useState(false);
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
        <div className="p-3 bg-zinc-800 rounded-lg">
          <FileCheck className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
          <p className="text-sm text-zinc-400">Identity verification status</p>
        </div>
      </div>
      <div className="p-6">
        <form onSubmit={handleVerify} className="space-y-4 max-w-md">
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
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Pay ₹11 & Verify"
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
