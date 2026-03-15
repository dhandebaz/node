import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Fetch conversations, wallet balance, and integrations in parallel
    const [conversationsResult, walletResult, integrationsResult] =
      await Promise.all([
        supabase
          .from("conversations")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("last_message_at", { ascending: false }),

        supabase
          .from("wallets")
          .select("balance")
          .eq("tenant_id", tenantId)
          .maybeSingle(),

        supabase
          .from("integrations")
          .select("provider, status")
          .eq("tenant_id", tenantId)
          .in("status", ["connected", "active", "pending_qr"]),
      ]);

    if (conversationsResult.error) throw conversationsResult.error;

    // Determine wallet status
    const walletBalance = walletResult.data?.balance ?? null;
    let walletStatus: "healthy" | "low" | "empty" | "unknown" = "unknown";
    if (walletBalance === null) {
      walletStatus = "unknown";
    } else if (walletBalance <= 0) {
      walletStatus = "empty";
    } else if (walletBalance < 50) {
      walletStatus = "low";
    } else {
      walletStatus = "healthy";
    }

    // Determine integration status and collect any channel errors
    const activeIntegrations = integrationsResult.data ?? [];
    const channelErrors: { channel: string; error: string }[] = [];

    // Check for integrations that are pending QR (incomplete setup)
    const pendingIntegrations = activeIntegrations.filter(
      (i) => i.status === "pending_qr",
    );
    for (const pending of pendingIntegrations) {
      channelErrors.push({
        channel: pending.provider,
        error: "QR code scan required to complete connection",
      });
    }

    // Determine overall integration status
    const connectedIntegrations = activeIntegrations.filter(
      (i) => i.status === "connected" || i.status === "active",
    );
    const integrationStatus =
      connectedIntegrations.length > 0 ? "connected" : "disconnected";

    // Map conversations to frontend format
    const mappedConversations = (conversationsResult.data ?? []).map(
      (conv: any) => ({
        id: conv.id,
        customerName: conv.contact_name || "Guest",
        customerPhone: conv.external_id || null,
        channel: conv.channel,
        lastMessage: conv.metadata?.last_message_preview || "No messages",
        lastMessageAt: conv.last_message_at,
        unreadCount: conv.metadata?.unread_count || 0,
        manager: { slug: "kaisa-ai", name: "Kaisa AI" },
        status: conv.status || "open",
        bookingId: conv.metadata?.booking_id || null,
        guestId: conv.metadata?.guest_id || null,
        aiPaused: conv.metadata?.ai_paused || false,
      }),
    );

    return NextResponse.json({
      conversations: mappedConversations,
      meta: {
        walletStatus,
        walletBalance,
        integrationStatus,
        connectedChannels: connectedIntegrations.map((i) => i.provider),
        channelErrors,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
