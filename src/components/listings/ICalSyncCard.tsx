"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api/fetcher";

export function ICalSyncCard({ listingId }: { listingId: string }) {
  const [platform, setPlatform] = useState("airbnb");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await fetchWithAuth(`/api/listings/${listingId}/sync/import`, {
        method: "POST",
        body: JSON.stringify({ platform, url }),
      });

      setMessage({ type: "success", text: "Calendar synced successfully!" });
      setUrl("");
    } catch (error) {
      setMessage({ type: "error", text: "Error syncing calendar. Please check the URL." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden rounded-3xl">
      <CardHeader className="border-b border-zinc-50 pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center gap-2">
          Sync External Calendar
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black">iCal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label htmlFor="platform" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Source Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger id="platform" className="rounded-xl border-zinc-200 bg-zinc-50/50 font-bold focus:ring-blue-500/20">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-zinc-200">
              <SelectItem value="generic">Generic Calendar</SelectItem>
              <SelectItem value="google">Google Calendar</SelectItem>
              <SelectItem value="airbnb">Airbnb / Hospitality</SelectItem>
              <SelectItem value="booking">Booking / OTA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="ical-url" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">External iCal URL</Label>
          <Input
            id="ical-url"
            placeholder="https://calendar.google.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-xl border-zinc-200 bg-zinc-50/50 font-bold focus:ring-blue-500/20"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pb-6">
        <Button 
          onClick={handleSync} 
          disabled={isLoading || !url} 
          className="w-full rounded-xl h-12 font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
        >
          {isLoading ? "Syncing..." : "Connect Calendar"}
        </Button>
        {message && (
          <p className={`text-[10px] font-black uppercase tracking-widest ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
