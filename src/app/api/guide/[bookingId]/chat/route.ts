import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveAISettings, getToneInstruction } from "@/lib/ai/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const google = createGoogleGenerativeAI();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { messages } = await req.json();
    const { bookingId } = await params;

    const supabase = getSupabaseAdmin();
    
    // Fetch booking with associated listing details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        listings (
          title,
          city,
          rules,
          metadata,
          check_in_time,
          check_out_time
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      console.error("Booking context fetch error:", error);
      return new NextResponse("Booking not found", { status: 404 });
    }

    const listing = (booking as any).listings;
    const wifiInfo = listing.metadata?.wifi || { network: "Villa_Guest", password: "serenity123" };
    const lockInfo = listing.metadata?.smart_lock || { pin: "4928" };

    const propertyContext = `
      You are the Nodebase Host AI Concierge for ${booking.guest_contact || "our guest"} at '${listing.title}' in ${listing.city || "Goa, India"}.
      The current guest is interacting via the Digital Welcome Guide.
      - Wi-Fi network: ${wifiInfo.network}
      - Wi-Fi password: ${wifiInfo.password}
      - Rules: ${listing.rules || "Please be respectful of the property."}
      - Check-in: ${listing.check_in_time || "2:00 PM"}
      - Check-out: ${listing.check_out_time || "11:00 AM"}
      - Smart Lock: PIN is ${lockInfo.pin}, press # after.
      - Extra services (late checkout, early checkin, airport transfer) can be purchased in the "Host Store" tab on this guide.
      
      Instructions:
      - Answer briefly and politely.
      - Do not break character as the AI host.
      - Never fabricate information.
    `;

    const settings = resolveAISettings({ model: "google/gemini-2.5-flash", tone: "friendly" });
    const modelInstance = google(settings.model.replace("google/", ""));

    const systemPrompt = `${propertyContext}\n\n${getToneInstruction(settings.tone)}`;

    const result = await streamText({
      model: modelInstance,
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Host AI Chat Error]:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
