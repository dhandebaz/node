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
      case "airbnb_host":
        return {
          countLabel: "How many properties do you manage?",
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
          countLabel: "How many active inventory items do you usually manage?",
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
          countLabel: "How many units should the employee manage?",
          platformLabel: "Which channels should we plan around?",
          platforms: [],
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          {config.countLabel}
        </label>
        <input
          type="number"
          min="1"
          value={propertyCount}
          onChange={(event) =>
            setPropertyCount(Number.parseInt(event.target.value || "0", 10))
          }
          className="public-input focus:ring-2 focus:ring-primary/20 font-bold text-lg px-6 py-4"
          required
        />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            {config.platformLabel}
          </label>
          <p className="mt-2 text-sm leading-6 text-muted-foreground font-sans">
            Select every channel that actually shapes the workflow today.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {config.platforms.map((platform) => {
            const selected = platforms.includes(platform.id);

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "public-inset flex items-center gap-4 rounded-2xl px-5 py-5 text-left transition-all hover:border-primary/30",
                  selected && "border-primary bg-primary/5 shadow-sm shadow-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-transparent",
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-sm font-bold uppercase tracking-tight transition-colors",
                  selected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {platform.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="public-button w-full px-8 py-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Configure my AI employee
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-relaxed max-w-sm mx-auto">
        Setup usually takes a couple of minutes. No card or platform passwords are
        needed at this step.
      </p>
    </form>
  );
}
