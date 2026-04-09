import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveAISettings, getToneInstruction } from "@/lib/ai/config";
import { z } from "zod";

const google = createGoogleGenerativeAI();

export type OmniIntent =
  | "GREETING"
  | "FAQ"
  | "URGENT_ISSUE"
  | "SALES_INQUIRY"
  | "ENGAGEMENT_INQUIRY"
  | "PAYMENT_SUPPORT"
  | "HUMAN_ESCALATION"
  | "UNKNOWN";

export interface OmniContext {
  clientName: string;
  resourceId: string;
  startDate: string;
  endDate: string;
  language?: string;
  channel: "WHATSAPP" | "INSTAGRAM" | "WEB_CHAT" | "EXTERNAL";
}

export class OmniAIExecutive {
  /**
   * Processes an incoming message across any channel (omnichannel).
   * It analyzes intent, checks DB context, and generates a reply.
   */
  static async processIncomingMessage(
    message: string,
    context: OmniContext
  ): Promise<{ responseText: string; intent: OmniIntent; suggestedStatus?: any }> {
    try {
      const settings = resolveAISettings({ model: "google/gemini-2.5-flash", tone: "professional" });
      const modelInstance = google(settings.model.replace("google/", ""));

      const systemPrompt = `
        You are the Omni AI Executive for Nodebase CRM, interacting with a client on ${context.channel}.
        Client Name: ${context.clientName}
        Service Reference: ${context.resourceId}
        Engagement Period: ${context.startDate} to ${context.endDate}
        Language Preference: ${context.language || "English"}

        Your objective is specialized lead management: analyze the client's message, classify the INTENT, and generate a premium, institutional RESPONSE.

        Valid Intents:
        - GREETING: Institutional greetings and introductory pleasantries.
        - FAQ: Service details, operational hours, logic, location, or access protocols.
        - URGENT_ISSUE: Critical failures, security concerns, or time-sensitive blockers (Escalate immediately).
        - SALES_INQUIRY: Potential interest in new services, extensions, or upsells.
        - ENGAGEMENT_INQUIRY: Inquiries regarding existing appointments, bookings, or agreements.
        - PAYMENT_SUPPORT: Billing questions, payment link requests, or financial status.
        - HUMAN_ESCALATION: Complex negotiations, angry sentiments, or requests for senior staff.
        - UNKNOWN: Ambiguous input.

        CRM Pipeline Management:
        - For payment link or financial data requests, suggest status 'payment_pending'.
        - For payment confirmations or closed deals, suggest status 'paid'.
        - For urgent issues or escalation requests, suggest status 'open' (Senior Staff Required).
        - For gratitude or concluded threads, suggest status 'resolved'.

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
            "URGENT_ISSUE",
            "SALES_INQUIRY",
            "ENGAGEMENT_INQUIRY",
            "PAYMENT_SUPPORT",
            "HUMAN_ESCALATION",
            "UNKNOWN",
          ]),
          suggestedStatus: z.enum(["open", "draft", "payment_pending", "paid", "scheduled", "resolved"]).optional(),
          response: z.string()
        }),
      });

      return {
        responseText: result.object.response || "One of our associates will be with you shortly to assist with your request.",
        intent: result.object.intent || "UNKNOWN",
        suggestedStatus: result.object.suggestedStatus
      };

    } catch (error) {
      console.error("[OmniAIExecutive Error]:", error);
      return {
        responseText: "Hi, I'm currently experiencing a technical update. I am notifying our executive team to assist you manually.",
        intent: "HUMAN_ESCALATION",
      };
    }
  }
}
