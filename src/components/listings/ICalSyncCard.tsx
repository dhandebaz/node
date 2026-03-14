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
    <Card>
      <CardHeader>
        <CardTitle>Sync Calendar (iCal)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="booking">Booking.com</SelectItem>
              <SelectItem value="vrbo">Vrbo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ical-url">iCal URL</Label>
          <Input
            id="ical-url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button onClick={handleSync} disabled={isLoading || !url} className="w-full">
          {isLoading ? "Syncing..." : "Sync Calendar"}
        </Button>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
