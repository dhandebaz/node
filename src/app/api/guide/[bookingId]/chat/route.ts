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
      You are the Nodebase Business AI Assistant for the user at '${listing.title}' in ${listing.city || "Mumbai, India"}.
      The current client is interacting via the Service Portal.
      - Access details & procedures: ${listing.rules || "Standard business guidelines apply."}
      - Operations: ${listing.check_in_time || "9:00 AM"} to ${listing.check_out_time || "6:00 PM"}
      - Integration Details: PIN is ${lockInfo.pin}, following the '#' key protocol if applicable.
      - Additional services and add-ons can be purchased in the "Marketplace" tab on this portal.
      
      Instructions:
      - Answer briefly and professionally.
      - Maintain a helpful and efficient persona.
      - Never fabricate details; if information is missing, ask the user to contact human support.
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
