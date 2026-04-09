import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveAISettings, getToneInstruction } from "@/lib/ai/config";
import { z } from "zod";

const google = createGoogleGenerativeAI();

export type CoHostIntent =
  | "GREETING"
  | "FAQ"
  | "MAINTENANCE_ISSUE"
  | "UPSELL_INQUIRY"
  | "BOOKING_INQUIRY"
  | "PAYMENT_ISSUE"
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
  ): Promise<{ responseText: string; intent: CoHostIntent; suggestedStatus?: any }> {
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
        - BOOKING_INQUIRY: Guest wants to book or extend.
        - PAYMENT_ISSUE: Payment failed or guest asking for link.
        - HUMAN_ESCALATION: Angry guest, complex request that needs a real person.
        - UNKNOWN: Cannot determine.

        CRM Pipeline Management:
        - If the guest is asking for a payment link or bank details, suggest status 'payment_pending'.
        - If the guest says they have paid or confirmed, suggest status 'paid'.
        - If the guest is angry or has a maintenance issue, suggest status 'open' (needs human intervention).
        - If the guest is just saying goodbye or thanks, suggest status 'resolved'.

        ${getToneInstruction(settings.tone)}
      `;

      const result = await generateObject({
        model: modelInstance,
        system: systemPrompt,
        prompt: message,
        schema: z.object({
          intent: z.enum([
            "GREETING",
            "FAQ",
            "MAINTENANCE_ISSUE",
            "UPSELL_INQUIRY",
            "BOOKING_INQUIRY",
            "PAYMENT_ISSUE",
            "HUMAN_ESCALATION",
            "UNKNOWN",
          ]),
          suggestedStatus: z.enum(["open", "draft", "payment_pending", "paid", "scheduled", "resolved"]).optional(),
          response: z.string()
        }),
      });

      return {
        responseText: result.object.response || "I will have the host get back to you shortly.",
        intent: result.object.intent || "UNKNOWN",
        suggestedStatus: result.object.suggestedStatus
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
