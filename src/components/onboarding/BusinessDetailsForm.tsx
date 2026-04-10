"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BusinessType } from "@/types";
import { businessDetailsSchema } from "@/lib/validations/onboarding";

interface BusinessDetailsFormProps {
  businessType: BusinessType;
  onSubmit: (details: { propertyCount: number; platforms: string[] }) => void;
  loading: boolean;
}

const STORAGE_KEY = "onboarding_business_details";

export function BusinessDetailsForm({
  businessType,
  onSubmit,
  loading,
}: BusinessDetailsFormProps) {
  const [propertyCount, setPropertyCount] = useState<number>(1);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.propertyCount) setPropertyCount(parsed.propertyCount);
        if (parsed.platforms) setPlatforms(parsed.platforms);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ propertyCount, platforms }));
  }, [propertyCount, platforms, isLoaded]);

  const getQuestionConfig = () => {
    switch (businessType) {
      case "service_business":
        return {
          countLabel: "How many active projects or retainers do you manage?",
          platformLabel: "Where do your leads come from?",
          platforms: [
            { id: "linkedin", label: "LinkedIn" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "email", label: "Email" },
            { id: "referrals", label: "Referrals" },
            { id: "website", label: "Company Website" },
          ],
        };
      case "airbnb_host":
        return {
          countLabel: "How many properties or units do you manage?",
          platformLabel: "Which channels matter most right now?",
          platforms: [
            { id: "airbnb", label: "Airbnb" },
            { id: "booking", label: "Booking.com" },
            { id: "mmt", label: "MakeMyTrip" },
            { id: "agoda", label: "Agoda" },
            { id: "direct", label: "Direct or WhatsApp" },
          ],
        };
      case "kirana_store":
        return {
          countLabel: "Roughly how many daily orders do you handle?",
          platformLabel: "How do customers reach you?",
          platforms: [
            { id: "whatsapp", label: "WhatsApp" },
            { id: "walkin", label: "Walk-in" },
            { id: "phone", label: "Phone call" },
            { id: "swiggy", label: "Swiggy or Zomato" },
            { id: "online", label: "Online store" },
          ],
        };
      case "doctor_clinic":
        return {
          countLabel: "How many patients or appointments per day?",
          platformLabel: "Where does appointment traffic come from?",
          platforms: [
            { id: "call", label: "Phone call" },
            { id: "walkin", label: "Walk-in" },
            { id: "practo", label: "Practo" },
            { id: "google", label: "Google Business" },
            { id: "whatsapp", label: "WhatsApp" },
          ],
        };
      case "thrift_store":
        return {
          countLabel: "How many active inventory items do you manage?",
          platformLabel: "Where are you currently selling?",
          platforms: [
            { id: "instagram", label: "Instagram" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "depop", label: "Depop or Poshmark" },
            { id: "website", label: "Website" },
            { id: "popups", label: "Pop-up stores" },
          ],
        };
      default:
        return {
          countLabel: "How many units should the AI employee manage?",
          platformLabel: "Which channels should we plan around?",
          platforms: [
            { id: "whatsapp", label: "WhatsApp" },
            { id: "email", label: "Email" },
            { id: "web", label: "Web Widget" },
          ],
        };
    }
  };

  const config = getQuestionConfig();

  const togglePlatform = (id: string) => {
    setPlatforms((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = businessDetailsSchema.safeParse({ propertyCount, platforms });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid input.");
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    onSubmit(result.data);
  };

  if (!isLoaded) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-4">
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
          {config.countLabel}
        </label>
        <input
          type="number"
          min="1"
          value={propertyCount}
          onChange={(event) =>
            setPropertyCount(Number.parseInt(event.target.value || "0", 10))
          }
          className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] px-6 py-5 text-xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all shadow-sm"
          required
        />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
            {config.platformLabel}
          </label>
          <p className="mt-2 text-sm font-bold text-slate-400">
            Select the primary channels that drive your operational traffic.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {config.platforms.map((platform) => {
            const selected = platforms.includes(platform.id);

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex items-center gap-4 rounded-[1.5rem] px-6 py-6 text-left transition-all border-2 border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50",
                  selected && "border-indigo-600 bg-indigo-50/20 shadow-lg shadow-indigo-100/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-b-4 transition-all shadow-sm",
                    selected
                      ? "border-indigo-800 bg-indigo-600 text-white"
                      : "border-slate-200 bg-slate-100 text-transparent",
                  )}
                >
                  <Check className="h-4 w-4" strokeWidth={4} />
                </div>
                <span className={cn(
                  "text-sm font-black uppercase tracking-tight transition-colors",
                  selected ? "text-slate-900" : "text-slate-400"
                )}>
                  {platform.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full py-6"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Authorize Deployment
          </button>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed max-w-xs mx-auto italic">
            Deployment establishes secure handshakes and neural state. No billing credentials required until launch.
          </p>
      </div>
    </form>
  );
}
