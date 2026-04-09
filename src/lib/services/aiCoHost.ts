import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveAISettings, getToneInstruction } from "@/lib/ai/config";

const google = createGoogleGenerativeAI();

export type CoHostIntent =
  | "GREETING"
  | "FAQ"
  | "MAINTENANCE_ISSUE"
  | "UPSELL_INQUIRY"
  | "HUMAN_ESCALATION"
  | "UNKNOWN";

export interface CoHostContext {
  guestName: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  language?: string;
  channel: "WHATSAPP" | "AIRBNB" | "BOOKING_COM";
}

export class AICoHostEngine {
  /**
   * Processes an incoming message across any channel (omnichannel).
   * It analyzes intent, checks DB context, and generates a reply.
   */
  static async processIncomingMessage(
    message: string,
    context: CoHostContext
  ): Promise<{ responseText: string; intent: CoHostIntent }> {
    try {
      const settings = resolveAISettings({ model: "google/gemini-2.5-flash", tone: "professional" });
      const modelInstance = google(settings.model.replace("google/", ""));

      const systemPrompt = `
        You are the AI Co-Host for Nodebase dealing with a guest on ${context.channel}.
        Guest Name: ${context.guestName}
        Check-in: ${context.checkIn}
        Check-out: ${context.checkOut}
        Language Preference: ${context.language || "English"}

        Your job is to read the guest's message, classify its INTENT, and write a helpful RESPONSE in the guest's preferred language.

        Valid Intents:
        - GREETING: General hello or pleasantries.
        - FAQ: Wi-Fi, checkout time, rules, location, locking the door.
        - MAINTENANCE_ISSUE: Broken AC, plumbing, dirty room (Escalate this).
        - UPSELL_INQUIRY: Late checkout, airport pickup, extra cleaning.
        - HUMAN_ESCALATION: Angry guest, complex request that needs a real person.
        - UNKNOWN: Cannot determine.

        Return a JSON response strictly matching this structure:
        {
          "intent": "INTENT_NAME",
          "response": "Your helpful reply to the guest."
        }

        ${getToneInstruction(settings.tone)}
      `;

      const result = await generateText({
        model: modelInstance,
        system: systemPrompt,
        prompt: message,
      });

      // Simple pseudo-JSON parsing. In production use `generateObject` with Zod schema.
      const rawText = result.text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      const parsed = JSON.parse(rawText);

      return {
        responseText: parsed.response || "I will have the host get back to you shortly.",
        intent: parsed.intent as CoHostIntent || "UNKNOWN",
      };

    } catch (error) {
      console.error("[AICoHostEngine Error]:", error);
      return {
        responseText: "Hi, I'm currently unable to assist via AI. I will notify your human host right away.",
        intent: "HUMAN_ESCALATION",
      };
    }
  }
}
