import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const suggestionMap: Record<string, string[]> = {
  "conv-1001": [
    "We can confirm early check-in at 11 AM. Shall I lock it?",
    "I can send the payment link now.",
    "Would you like us to arrange airport pickup?"
  ],
  "conv-1002": [
    "Your order is on the way. Sharing tracking details shortly.",
    "Delivery is scheduled for tomorrow between 2–4 PM.",
    "Would you like a call back once it reaches your city?"
  ],
  "conv-1003": [
    "Friday 4 PM is available. Should I confirm?",
    "Would you like a reminder sent 2 hours before the visit?",
    "We can also schedule a video consult if preferred."
  ],
  "conv-1004": [
    "Rates start at ₹6,500 per night for March.",
    "I can block the dates and share a booking link.",
    "Would you like availability for the exact dates?"
  ]
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const conversationId = body?.conversationId;

    return NextResponse.json({ suggestions: suggestionMap[conversationId] || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load suggestions" }, { status: 500 });
  }
}
