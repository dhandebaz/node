import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const now = Date.now();

const messageMap: Record<string, any[]> = {
  "conv-1001": [
    {
      id: "msg-1001",
      conversationId: "conv-1001",
      senderType: "customer",
      channel: "whatsapp",
      content: "Hi, is early check-in possible for tomorrow?",
      timestamp: new Date(now - 1000 * 60 * 60).toISOString()
    },
    {
      id: "msg-1002",
      conversationId: "conv-1001",
      senderType: "ai",
      channel: "whatsapp",
      content: "Yes, early check-in at 11 AM is available. Would you like us to confirm?",
      timestamp: new Date(now - 1000 * 60 * 55).toISOString()
    },
    {
      id: "msg-1003",
      conversationId: "conv-1001",
      senderType: "customer",
      channel: "whatsapp",
      content: "Confirm it please and share the payment link.",
      timestamp: new Date(now - 1000 * 60 * 12).toISOString()
    }
  ],
  "conv-1002": [
    {
      id: "msg-2001",
      conversationId: "conv-1002",
      senderType: "customer",
      channel: "instagram",
      content: "Has the order shipped yet?",
      timestamp: new Date(now - 1000 * 60 * 75).toISOString()
    },
    {
      id: "msg-2002",
      conversationId: "conv-1002",
      senderType: "human",
      channel: "instagram",
      content: "Yes, it shipped today. I will share tracking in a moment.",
      timestamp: new Date(now - 1000 * 60 * 50).toISOString()
    }
  ],
  "conv-1003": [
    {
      id: "msg-3001",
      conversationId: "conv-1003",
      senderType: "customer",
      channel: "messenger",
      content: "Can we reschedule the appointment to Friday?",
      timestamp: new Date(now - 1000 * 60 * 180).toISOString()
    },
    {
      id: "msg-3002",
      conversationId: "conv-1003",
      senderType: "ai",
      channel: "messenger",
      content: "Friday 4 PM is available. Shall I lock it?",
      timestamp: new Date(now - 1000 * 60 * 160).toISOString()
    }
  ],
  "conv-1004": [
    {
      id: "msg-4001",
      conversationId: "conv-1004",
      senderType: "customer",
      channel: "web",
      content: "Need pricing for a 3-night stay in March.",
      timestamp: new Date(now - 1000 * 60 * 260).toISOString()
    }
  ]
};

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  return NextResponse.json({ messages: messageMap[conversationId] || [] });
}
