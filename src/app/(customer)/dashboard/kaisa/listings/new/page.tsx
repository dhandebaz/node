"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { SessionExpiredCard } from "@/components/customer/SessionExpiredCard";
import { SessionExpiredError } from "@/lib/api/errors";
import { ListingIntegration, ListingPlatform, ListingType } from "@/types";

const platformLabels: Record<ListingPlatform, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  mmt: "MakeMyTrip / GoIbibo"
};

const listingTypes: ListingType[] = ["Apartment", "Villa", "Homestay", "Guest House"];

export default function AddListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [listingId] = useState(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `local-${Date.now()}`));
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<ListingType>("Homestay");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [internalNotes, setInternalNotes] = useState("");
  const [platforms, setPlatforms] = useState<ListingPlatform[]>([]);
  const [externalIcalUrls, setExternalIcalUrls] = useState<Record<ListingPlatform, string>>({
    airbnb: "",
    booking: "",
    mmt: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const nodebaseIcalUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/public/ical/${listingId}`;
  }, [listingId]);

  const togglePlatform = (platform: ListingPlatform) => {
    setPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  };

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) {
      setMessage("Property name and city are required.");
      return;
    }
    try {
      setSaving(true);
      setMessage(null);
      const integrations: ListingIntegration[] = platforms.map((platform) => ({
        listingId,
        platform,
        externalIcalUrl: externalIcalUrls[platform] || null,
        lastSyncedAt: null,
        status: externalIcalUrls[platform] ? "connected" : "not_connected"
      }));

      const payload = {
        listing: {
          id: listingId,
          userId: "current",
          name: name.trim(),
          city: city.trim(),
          type,
          timezone,
          status: integrations.length > 0 ? "active" : "incomplete",
          internalNotes: internalNotes.trim() || null,
          createdAt: new Date().toISOString(),
          platformsConnected: integrations.filter((i) => i.externalIcalUrl).map((i) => i.platform),
          calendarSyncStatus: integrations.some((i) => i.externalIcalUrl) ? "never_synced" : "not_connected",
          nodebaseIcalUrl
        },
        integrations
      };

      await fetchWithAuth("/api/listings/create", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      router.push("/dashboard/kaisa/listings");
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("local_listings_v2");
        const localListings = stored ? JSON.parse(stored) : [];
        localListings.push({
          id: listingId,
          name,
          city,
          type,
          timezone,
          status: platforms.length > 0 ? "active" : "incomplete",
          internalNotes,
          createdAt: new Date().toISOString(),
          platformsConnected: platforms,
          calendarSyncStatus: platforms.length > 0 ? "never_synced" : "not_connected",
          nodebaseIcalUrl,
          integrations
        });
        window.localStorage.setItem("local_listings_v2", JSON.stringify(localListings));
      }
      setMessage("Saved locally. Listing will sync once integrations are active.");
    } finally {
      setSaving(false);
    }
  };

  if (sessionExpired) {
    return <SessionExpiredCard />;
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Add Property</h1>
        <p className="text-white/60 text-sm">Step-by-step setup for your listing and calendar sync.</p>
      </div>

      <div className="dashboard-surface p-6 space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
          <span className={step >= 1 ? "text-white" : ""}>1. Basic Info</span>
          <span>•</span>
          <span className={step >= 2 ? "text-white" : ""}>2. External Platforms</span>
          <span>•</span>
          <span className={step >= 3 ? "text-white" : ""}>3. Nodebase Calendar</span>
          <span>•</span>
          <span className={step >= 4 ? "text-white" : ""}>4. Review</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider">Property name</div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider">City</div>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider">Property type</div>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as ListingType)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {listingTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider">Timezone</div>
                <input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-white/50 uppercase tracking-wider">Internal notes (optional)</div>
              <textarea
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[80px]"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Where is this property listed?</h2>
              <p className="text-sm text-white/60">Choose any platform where guests can book this property.</p>
            </div>
            <div className="space-y-3">
              {(Object.keys(platformLabels) as ListingPlatform[]).map((platform) => (
                <label key={platform} className="flex items-center gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10"
                  />
                  {platformLabels[platform]}
                </label>
              ))}
            </div>
            {platforms.map((platform) => (
              <div key={platform} className="space-y-2">
                <div className="text-xs text-white/50 uppercase tracking-wider">
                  Paste the calendar link from {platformLabels[platform]}
                </div>
                <input
                  value={externalIcalUrls[platform]}
                  onChange={(event) =>
                    setExternalIcalUrls((prev) => ({ ...prev, [platform]: event.target.value }))
                  }
                  placeholder="https://example.com/calendar.ics"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <div className="text-xs text-white/40">
                  We use this link to pull bookings into Nodebase.
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Nodebase calendar link</h2>
              <p className="text-sm text-white/60">
                Copy this link and paste it into Airbnb or Booking.com to sync bookings from Nodebase.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={nodebaseIcalUrl}
                readOnly
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80"
              />
              <button
                onClick={async () => {
                  if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(nodebaseIcalUrl);
                    setMessage("Calendar link copied.");
                  }
                }}
                className="px-3 py-2 rounded-lg border border-white/20 text-white text-xs font-semibold"
              >
                Copy
              </button>
            </div>
            <div className="text-xs text-white/50">
              This enables two-way sync: external bookings → Nodebase, Nodebase bookings → external platforms.
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Review</h2>
            <div className="grid gap-4 text-sm text-white/70">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-white/40">Listing</div>
                <div className="text-white font-semibold">{name || "Untitled property"}</div>
                <div>{city || "City not set"} · {type}</div>
                <div>{timezone}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-white/40">Platforms</div>
                {platforms.length === 0 ? (
                  <div>No platforms linked yet.</div>
                ) : (
                  <div>{platforms.map((platform) => platformLabels[platform]).join(", ")}</div>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-white/40">Nodebase calendar link</div>
                <div className="text-xs text-white/70 break-all">{nodebaseIcalUrl}</div>
              </div>
            </div>
          </div>
        )}

        {message && <div className="text-xs text-white/60">{message}</div>}

        <div className="flex flex-wrap gap-3 justify-between">
          <button
            onClick={() => (step === 1 ? router.push("/dashboard/kaisa/listings") : setStep((prev) => prev - 1))}
            className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => Math.min(prev + 1, 4))}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
