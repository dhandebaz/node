import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export interface PriceSuggestion {
  date: string;
  suggestedPrice: number;
  currentPrice: number;
  reason: string;
  confidence: number;
}

export class RevenueService {
  /**
   * Analyze occupancy and suggest prices for the next 30 days.
   */
  static async generatePriceSuggestions(
    tenantId: string,
    listingId: string,
  ): Promise<PriceSuggestion[]> {
    const supabase = await getSupabaseServer();

    // 1. Get Listing & Settings
    const { data: listing } = await supabase
      .from("listings")
      .select("base_price, dynamic_pricing_settings")
      .eq("id", listingId)
      .single();

    if (!listing) throw new Error("Listing not found");

    const basePrice = Number(listing.base_price || 1000);
    const settings = listing.dynamic_pricing_settings || {};

    // 2. Get Bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("start_date, end_date")
      .eq("listing_id", listingId)
      .neq("status", "cancelled");

    const suggestions: PriceSuggestion[] = [];
    const now = new Date();

    // 3. Simple Dynamic Pricing Logic (Simplified version of AirDNA/PriceLabs)
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);
      const dateStr = targetDate.toISOString().split("T")[0];
      const isWeekend = targetDate.getDay() === 5 || targetDate.getDay() === 6; // Fri, Sat

      // Check if date is already booked
      const isBooked = (bookings || []).some((b) => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        return targetDate >= start && targetDate < end;
      });

      if (isBooked) continue;

      let multiplier = 1.0;
      let reason = "Base price applied.";

      // Strategy: Balanced
      // Weekend markup
      if (isWeekend) {
        multiplier *= settings.weekend_markup || 1.2;
        reason = "Weekend demand surge.";
      }

      // Last minute discount (next 3 days)
      if (i <= 3) {
        multiplier *= settings.last_minute_discount || 0.8;
        reason = "Last-minute occupancy boost.";
      }

      // Proximity to other bookings (Fill the gaps)
      // (Skipped for simplicity, but could be added here)

      const suggestedPrice = Math.round(basePrice * multiplier);

      // Clamp to min/max
      const finalPrice = Math.min(
        Math.max(suggestedPrice, settings.min_price || 0),
        settings.max_price || 100000,
      );

      if (finalPrice !== basePrice) {
        suggestions.push({
          date: dateStr,
          suggestedPrice: finalPrice,
          currentPrice: basePrice,
          reason,
          confidence: 0.85,
        });
      }
    }

    return suggestions;
  }

  /**
   * Save suggestions to the DB for user review.
   */
  static async saveSuggestions(
    tenantId: string,
    listingId: string,
    suggestions: PriceSuggestion[],
  ) {
    const supabase = await getSupabaseServer();

    const inserts = suggestions.map((s) => ({
      tenant_id: tenantId,
      listing_id: listingId,
      date: s.date,
      suggested_price: s.suggestedPrice,
      current_price: s.currentPrice,
      reason: s.reason,
      confidence: s.confidence,
      status: "pending",
    }));

    if (inserts.length === 0) return;

    // Delete old pending suggestions first
    await supabase
      .from("price_suggestions")
      .delete()
      .eq("listing_id", listingId)
      .eq("status", "pending");

    const { error } = await supabase.from("price_suggestions").insert(inserts);

    if (error) {
      log.error("Failed to save price suggestions", error);
      throw error;
    }
  }

  /**
   * Apply a specific suggestion (updates listing price or adds override).
   */
  static async applySuggestion(suggestionId: string) {
    const supabase = await getSupabaseServer();

    const { data: suggestion } = await supabase
      .from("price_suggestions")
      .select("*")
      .eq("id", suggestionId)
      .single();

    if (!suggestion) throw new Error("Suggestion not found");

    // 1. Record in history
    await supabase.from("listing_price_history").insert({
      tenant_id: suggestion.tenant_id,
      listing_id: suggestion.listing_id,
      date: suggestion.date,
      price: suggestion.suggested_price,
      reason: `AI Suggestion: ${suggestion.reason}`,
    });

    // 2. Mark suggestion as applied
    await supabase
      .from("price_suggestions")
      .update({ status: "applied", updated_at: new Date().toISOString() })
      .eq("id", suggestionId);

    // Note: iCal is a pull protocol — OTAs fetch our calendar URL on their schedule.
    // Direct price pushes to Airbnb/Booking.com require their proprietary APIs
    // (Airbnb Open API, Booking.com Content API) which are gated behind partner agreements.
    // The price suggestion is recorded in listing_price_history and is reflected in the
    // public iCal feed generated at /api/public/ical/[listingId]. OTAs will pick it up
    // on their next scheduled sync cycle.
    return { success: true };
  }
}
