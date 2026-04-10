"use client";

import { X, Sparkles, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InboxModalsProps {
  showSmartLinkModal: boolean;
  setShowSmartLinkModal: (val: boolean) => void;
  smartLinkForm: {
    listingId: string;
    amount: string;
    startDate: string;
    endDate: string;
  };
  setSmartLinkData: (val: any) => void;
  smartLinkLoading: boolean;
  handleCreateSmartLink: () => void;
  listings: any[];
  labels: {
    listing: string;
    checkIn: string;
    checkOut: string;
  };
}

export function InboxModals({
  showSmartLinkModal,
  setShowSmartLinkModal,
  smartLinkForm,
  setSmartLinkData,
  smartLinkLoading,
  handleCreateSmartLink,
  listings,
  labels
}: InboxModalsProps) {
  if (!showSmartLinkModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100">
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tighter flex items-center gap-2">
              Create Booking Link
              <Sparkles className="w-5 h-5 text-blue-600" />
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Generate a secure payment & booking link.</p>
          </div>
          <button onClick={() => setShowSmartLinkModal(false)} className="p-2 hover:bg-zinc-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select {labels.listing}</Label>
            <Select
              value={smartLinkForm.listingId}
              onValueChange={(val: string) => setSmartLinkData({ ...smartLinkForm, listingId: val })}
            >
              <SelectTrigger className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold">
                <SelectValue placeholder={`Select ${labels.listing}`} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                {listings.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Amount (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={smartLinkForm.amount}
              onChange={(e) => setSmartLinkData({ ...smartLinkForm, amount: e.target.value })}
              className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold focus:ring-blue-600/5 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{labels.checkIn}</Label>
              <Input
                type="date"
                value={smartLinkForm.startDate}
                onChange={(e) => setSmartLinkData({ ...smartLinkForm, startDate: e.target.value })}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{labels.checkOut}</Label>
              <Input
                type="date"
                value={smartLinkForm.endDate}
                onChange={(e) => setSmartLinkData({ ...smartLinkForm, endDate: e.target.value })}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateSmartLink}
            disabled={smartLinkLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {smartLinkLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            Generate & Insert Link
          </Button>
        </div>
      </div>
    </div>
  );
}
