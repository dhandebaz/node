import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { generateText } from "ai";
import { resolveAISettings } from "@/lib/ai/config";
import { settingsService } from "@/lib/services/settingsService";

interface SuggestionResponse {
  suggestions: string[];
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();
    const body = await request.json();
    const conversationId = body?.conversationId;

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    // Get conversation details
    const { data: conversation } = await supabase
      .from("conversations")
      .select("metadata")
      .eq("id", conversationId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    // Get recent messages for context
    const { data: messages } = await supabase
      .from("messages")
      .select("content, role, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get booking info if available
    let booking: any = null;
    const metadata = conversation?.metadata as Record<string, any> | null;
    const bookingId = metadata?.booking_id;
    if (bookingId) {
      const { data: b } = await supabase
        .from("bookings")
        .select("id, status, start_date, end_date, id_status, guests(name)")
        .eq("id", bookingId)
        .maybeSingle();
      booking = b;
    }

    // Build conversation context for AI
    const conversationHistory = messages
      ?.reverse()
      .map((m) => `${m.role === "user" ? "Guest" : "Host"}: ${m.content}`)
      .join("\n") || "";

    // Generate suggestions using AI
    const appSettings = await settingsService.getSettings();
    const kaisaRuntime = resolveAISettings({
      provider: appSettings.api.kaisaProvider,
      model: appSettings.api.kaisaModel,
    });

    // Get tenant business type for context
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    const businessType = tenant?.business_type || "airbnb_host";

    let suggestions: string[] = [];

    try {
      const prompt = `You are an AI assistant for a ${businessType} business. Based on the conversation history below, suggest 3 short, helpful reply options (max 20 words each) that the host/manager could send to the guest.

Format: Just return 3 short suggestions, one per line, nothing else.

Conversation History:
${conversationHistory}

${booking ? `Booking Info:
- Status: ${booking.status}
- Check-in: ${booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'TBD'}
- Check-out: ${booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'TBD'}
- ID Status: ${booking.id_status || 'Not requested'}` : ''}

Suggestions:`;

      const { text } = await generateText({
        model: kaisaRuntime.model,
        prompt,
      });

      // Parse suggestions from response
      suggestions = text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 100)
        .slice(0, 3);

      // If AI parsing fails, provide fallback suggestions
      if (suggestions.length === 0) {
        suggestions = getFallbackSuggestions(businessType, booking);
      }
    } catch (aiError) {
      console.error("AI suggestion error:", aiError);
      suggestions = getFallbackSuggestions(businessType, booking);
    }

    const response: SuggestionResponse = { suggestions };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("AI suggest error:", error);
    return NextResponse.json({ suggestions: getGenericSuggestions() }, { status: 200 });
  }
}

function getFallbackSuggestions(businessType: string, booking: any): string[] {
  switch (businessType) {
    case "airbnb_host":
      if (booking?.status !== "confirmed") {
        return [
          "I can confirm your booking and send the payment link.",
          "Would you like to know about early check-in options?",
          "Here's everything you need to know before arrival.",
        ];
      }
      return [
        "Your booking is confirmed. Check-in details have been sent.",
        "Let me know if you need any recommendations in the area.",
        "Feel free to reach out if you have any questions before arrival.",
      ];
    case "kirana_store":
    case "thrift_store":
      return [
        "Your order is on the way. Tracking details will be shared shortly.",
        "Would you like to know about our current offers?",
        "Is there anything else I can help you with?",
      ];
    case "doctor_clinic":
      return [
        "Your appointment is confirmed. Please arrive 10 minutes early.",
        "Would you like to reschedule to a different time?",
        "Remember to bring any previous medical records if available.",
      ];
    default:
      return [
        "Thank you for reaching out. How can I help you today?",
        "I understand. Let me look into this for you.",
        "Is there anything else you'd like to know?",
      ];
  }
}

function getGenericSuggestions(): string[] {
  return [
    "Thank you for your message. I'll get back to you shortly.",
    "Could you please provide more details?",
    "I'll check on this and get back to you.",
  ];
}
