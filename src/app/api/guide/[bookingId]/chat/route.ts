import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveAISettings, getToneInstruction } from "@/lib/ai/config";

const google = createGoogleGenerativeAI();

export async function POST(
  req: Request
) {
  try {
    const { messages } = await req.json();

    // Context that normally would be fetched from Supabase via `bookingId`
    // Mocking for development speed.
    const propertyContext = `
      You are the Nodebase Host AI Concierge for 'Villa Serenity' in Goa, India.
      The current guest is interacting via the Digital Welcome Guide.
      - Wi-Fi network: Villa_Guest
      - Wi-Fi password: serenity123
      - Rules: Quiet hours 10 PM to 8 AM.
      - Smart Lock: PIN is 4928, press # after.
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
