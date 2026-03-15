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
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[var(--public-ink)]">
          {config.countLabel}
        </label>
        <input
          type="number"
          min="1"
          value={propertyCount}
          onChange={(event) =>
            setPropertyCount(Number.parseInt(event.target.value || "0", 10))
          }
          className="public-input"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--public-ink)]">
          {config.platformLabel}
        </label>
        <p className="text-sm leading-6 text-[var(--public-muted)]">
          Select every channel that actually shapes the workflow today.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {config.platforms.map((platform) => {
            const selected = platforms.includes(platform.id);

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "public-inset flex items-center gap-3 rounded-[1.2rem] px-4 py-4 text-left transition-all",
                  selected && "border-[rgba(146,43,34,0.28)] bg-[rgba(214,88,74,0.08)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-[var(--public-accent)] bg-[var(--public-accent)] text-white"
                      : "border-[rgba(61,44,25,0.18)] text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm font-semibold text-[var(--public-ink)]">
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
        className="public-button w-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Configure my AI employee
      </button>

      <p className="text-center text-sm leading-6 text-[var(--public-muted)]">
        Setup usually takes a couple of minutes. No card or platform passwords are
        needed at this step.
      </p>
    </form>
  );
}
