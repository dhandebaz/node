"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";
import { SessionExpiredError } from "@/lib/api/errors";
import { ListingIntegration, ListingPlatform, ListingType } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  getBusinessLabels,
  getPersonaCapabilities,
} from "@/lib/business-context";
import { cn } from "@/lib/utils";
import { extractAirbnbInfo } from "@/app/actions/listings";
import { Search, Loader2, Sparkles } from "lucide-react";

const platformLabels: Record<ListingPlatform, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  mmt: "MakeMyTrip / GoIbibo",
};

const listingTypes: ListingType[] = [
  "Apartment",
  "Villa",
  "Homestay",
  "Guest House",
];

export default function AddListingPage() {
  const router = useRouter();
  const { tenant, listings, fetchDashboardData } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const [step, setStep] = useState(1);
  const [listingId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}`,
  );
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<ListingType>("Homestay");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [description, setDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<ListingPlatform[]>([]);
  const [externalIcalUrls, setExternalIcalUrls] = useState<
    Record<ListingPlatform, string>
  >({
    airbnb: "",
    booking: "",
    mmt: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [airbnbUrl, setAirbnbUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!capabilities.multi_listing && listings.length > 0) {
      router.push("/dashboard/ai/listings");
    }
  }, [capabilities.multi_listing, listings.length, router]);

  const nodebaseIcalUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/public/ical/${listingId}`;
  }, [listingId]);

  const togglePlatform = (platform: ListingPlatform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const nextStep = () => {
    if (step === 1 && !capabilities.calendar) {
      setStep(4);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    if (step === 1) {
      router.push("/dashboard/ai/listings");
      return;
    }
    if (step === 4 && !capabilities.calendar) {
      setStep(1);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) {
      setMessage("Property name and city are required.");
      return;
    }
    const integrations: ListingIntegration[] = platforms.map((platform) => ({
      listingId,
      platform,
      externalIcalUrl: externalIcalUrls[platform] || null,
      lastSyncedAt: null,
      status: externalIcalUrls[platform] ? "connected" : "not_connected",
    }));
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        listing: {
          id: listingId,
          userId: "current",
          name: name.trim(),
          city: city.trim(),
          address: address.trim() || null,
          type,
          timezone,
          status: integrations.length > 0 ? "active" : "incomplete",
          description: description.trim() || null,
          images: images,
          amenities: amenities,
          internalNotes: internalNotes.trim() || null,
          createdAt: new Date().toISOString(),
          platformsConnected: integrations
            .filter((i) => i.externalIcalUrl)
            .map((i) => i.platform),
          calendarSyncStatus: integrations.some((i) => i.externalIcalUrl)
            ? "never_synced"
            : "not_connected",
          nodebaseIcalUrl,
        },
        integrations,
      };

      await fetchWithAuth("/api/listings/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/dashboard/ai/listings");
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      console.error("Failed to create listing:", error);
      setMessage("Failed to create listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExtractAirbnb = async () => {
    if (!airbnbUrl.trim() || !airbnbUrl.includes("airbnb")) {
      setMessage("Please paste a valid Airbnb URL.");
      return;
    }

    try {
      setIsExtracting(true);
      setMessage(null);
      const result = await extractAirbnbInfo(airbnbUrl.trim());
      
      if (result.success && result.data) {
        setName(result.data.name);
        setCity(result.data.city);
        setType(result.data.type as ListingType);
        
        if (result.data.description) {
          setDescription(result.data.description);
        }
        
        if (result.data.images && result.data.images.length > 0) {
          setImages(result.data.images);
        }

        if (result.data.amenities && result.data.amenities.length > 0) {
          setAmenities(result.data.amenities);
        }

        setMessage("Listing details and images extracted successfully! ✨");
      } else {
        setMessage(result.error || "Could not extract details from this link.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage("An error occurred during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  if (sessionExpired) return <SessionExpiredCard />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight uppercase">New {labels.listing}</h1>
        <p className="text-zinc-400">Step {step} of 4: {step === 1 ? "Basic Info" : step === 2 ? "External Platforms" : step === 3 ? "Nodebase Calendar" : "Review"}</p>
      </header>

      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Airbnb Importer Section */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Quick Import
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Paste an Airbnb listing link to automatically pre-fill property details.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="url"
                    value={airbnbUrl}
                    onChange={(e) => setAirbnbUrl(e.target.value)}
                    placeholder="https://www.airbnb.com/rooms/..."
                    className="input-glass pl-10 text-xs py-2"
                  />
                </div>
                <button
                  onClick={handleExtractAirbnb}
                  disabled={isExtracting || !airbnbUrl}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    isExtracting
                      ? "bg-zinc-800 text-zinc-500 cursor-wait"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(66,133,244,0.3)]"
                  )}
                >
                  {isExtracting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Extracting...
                    </div>
                  ) : (
                    "Auto-Fill"
                  )}
                </button>
              </div>
            </div>

            {/* Image Gallery Preview */}
            {images.length > 0 && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Extracted Gallery ({images.length} photos)
                </label>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative min-w-[200px] h-[130px] rounded-xl overflow-hidden glass-panel border-white/10 group snap-center"
                    >
                      <img 
                        src={img} 
                        alt={`Property ${idx}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <span className="text-[10px] text-white/70 font-mono">IMG_{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="listing-name"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                >
                  {labels.listing} name
                </label>
                <input
                  id="listing-name"
                  name="listingName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={`Enter ${labels.listing} name`}
                  aria-required="true"
                  className="input-glass"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="listing-city"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                >
                  City
                </label>
                <input
                  id="listing-city"
                  name="listingCity"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City or area (e.g., New Delhi)"
                  aria-required="true"
                  className="input-glass"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="listing-address"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                >
                  Full Address
                </label>
                <input
                  id="listing-address"
                  name="listingAddress"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street name, landmark, etc."
                  className="input-glass"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="listing-type"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                >
                  {labels.listing} type
                </label>
                <select
                  id="listing-type"
                  name="listingType"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as ListingType)
                  }
                  aria-label={`${labels.listing} type`}
                  className="input-glass bg-zinc-900 text-white cursor-pointer"
                >
                  {listingTypes.map((option) => (
                    <option key={option} value={option} className="bg-zinc-900 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="listing-timezone"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
                >
                  Timezone
                </label>
                <input
                  id="listing-timezone"
                  name="listingTimezone"
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="e.g., Asia/Kolkata"
                  aria-label="Time zone"
                  className="input-glass"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="listing-description"
                className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
              >
                Public Description
              </label>
              <textarea
                id="listing-description"
                name="listingDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="input-glass min-h-[120px]"
                placeholder="Describe your property for guests..."
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="listing-notes"
                className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
              >
                Internal notes{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="listing-notes"
                name="listingNotes"
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                aria-label="Internal notes"
                className="input-glass min-h-[80px]"
                placeholder="Internal notes for your team (optional)"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Where is this {labels.listing.toLowerCase()} listed?
              </h2>
              <p className="text-sm text-zinc-400">
                Choose any platform where {labels.customers.toLowerCase()} can
                book this {labels.listing.toLowerCase()}.
              </p>
            </div>
            <div className="space-y-3">
              {(Object.keys(platformLabels) as ListingPlatform[]).map(
                (platform) => (
                  <label
                    key={platform}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="h-4 w-4 rounded border-white/30 bg-white/10"
                    />
                    {platformLabels[platform]}
                  </label>
                ),
              )}
            </div>
            {platforms.map((platform) => (
              <div key={platform} className="space-y-2">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Paste the calendar link from {platformLabels[platform]}
                </div>
                <input
                  value={externalIcalUrls[platform]}
                  onChange={(event) =>
                    setExternalIcalUrls((prev) => ({
                      ...prev,
                      [platform]: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/calendar.ics"
                  className="input-glass"
                />
                <div className="text-xs text-zinc-500">
                  We use this link to pull bookings into Nodebase.
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Nodebase calendar link
              </h2>
              <p className="text-sm text-zinc-400">
                Copy this link and paste it into Airbnb or Booking.com to sync
                bookings from Nodebase.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={nodebaseIcalUrl}
                readOnly
                className="flex-1 input-glass text-xs"
              />
              <button
                onClick={async () => {
                  if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(nodebaseIcalUrl);
                    setMessage("Calendar link copied.");
                  }
                }}
                className="px-3 py-2 rounded-lg border border-white/20 text-white text-xs font-semibold hover:bg-white/10"
              >
                Copy
              </button>
            </div>
            <div className="text-xs text-zinc-500">
              This enables two-way sync: external bookings → Nodebase, Nodebase
              bookings → external platforms.
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold text-white">
              Review
            </h2>
            <div className="grid gap-4 text-sm text-zinc-300">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-zinc-500">
                  {labels.listing}
                </div>
                <div className="text-white font-semibold">
                  {name || `Untitled ${labels.listing.toLowerCase()}`}
                </div>
                <div>
                  {address || city || "Location not set"} · {type}
                </div>
                {images.length > 0 && (
                  <div className="text-xs text-primary font-bold">
                    {images.length} photos ready for import
                  </div>
                )}
                <div>{timezone}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-zinc-500">
                  Platforms
                </div>
                {platforms.length === 0 ? (
                  <div>No platforms linked yet.</div>
                ) : (
                  <div>
                    {platforms
                      .map((platform) => platformLabels[platform])
                      .join(", ")}
                  </div>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-zinc-500">
                  Nodebase calendar link
                </div>
                <div className="text-xs text-zinc-400 break-all">
                  {nodebaseIcalUrl}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="text-xs text-zinc-400 mt-4">{message}</div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-wrap gap-3 justify-between glass-nav px-6 py-4 border-t border-white/10 md:static md:bg-transparent md:border-none md:p-0 md:mt-8">
          <button
            onClick={prevStep}
            className="button-glass px-8"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="button-primary"
              aria-label="Continue to next step"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving ? "true" : "false"}
              className={`button-primary ${saving ? "opacity-80 cursor-wait" : ""}`}
              aria-label={`Save ${labels.listing}`}
            >
              {saving ? "Saving..." : `Save ${labels.listing}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
