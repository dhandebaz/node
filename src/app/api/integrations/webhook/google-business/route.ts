import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { googleBusinessService } from "@/lib/services/googleBusinessService";
import { InboxService } from "@/lib/services/inboxService";
import { ContactService, type ContactIdentifier } from "@/lib/services/contactService";
import { NotificationService } from "@/lib/services/notificationService";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.nextUrl.searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    log.info("[GoogleBusiness Webhook] Received message", {
      tenantId,
      hasMessage: !!body.message,
    });

    const message = googleBusinessService.parseIncomingMessage(body);
    if (!message) {
      return NextResponse.json({ status: "ignored" });
    }

    const supabase = await getSupabaseServer();

    const { data: integration } = await supabase
      .from("integrations")
      .select("credentials, tenant_id")
      .eq("provider", "google-business")
      .eq("status", "active")
      .single();

    if (!integration?.tenant_id) {
      log.warn("[GoogleBusiness] No active integration found");
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const resolvedTenantId = integration.tenant_id;
    const conversationId = body.conversationId || `google-${message.sender.userId}`;

    await InboxService.syncConversation({
      tenantId: resolvedTenantId,
      channel: "google-business",
      externalId: conversationId,
      contactName: message.sender.name,
      lastMessagePreview: message.text,
    });

    const identifiers: ContactIdentifier[] = [
      { type: "other", value: message.sender.userId || `unknown-${Date.now()}` },
    ];

    const contactResult = await ContactService.resolveContact(
      resolvedTenantId,
      identifiers,
      { name: message.sender.name || "Google Business User" }
    );

    if (contactResult.contact?.id) {
      const adminSupabase = await getSupabaseAdmin();
      await NotificationService.sendNotification(adminSupabase, {
        type: "message_received",
        tenantId: resolvedTenantId,
        title: "New Google Business Message",
        message: `${message.sender.name || "Customer"}: ${message.text.slice(0, 100)}`,
        data: { conversationId },
        channel: "google-business",
        contactId: contactResult.contact.id,
      });
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    log.error("[GoogleBusiness Webhook] Error", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
