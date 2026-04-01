import { NextRequest, NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();

    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status, credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "telegram")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    const credentials = integration.credentials as any;
    const botUsername = credentials?.bot_username;

    return NextResponse.json({
      connected: integration.status === "active",
      bot_username: botUsername,
      bot_token: credentials?.bot_token ? "***" + credentials.bot_token.slice(-4) : undefined,
    });
  } catch (error: any) {
    console.error("Get telegram integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();
    const body = await request.json();
    const { bot_token } = body;

    if (!bot_token) {
      return NextResponse.json({ error: "Bot token required" }, { status: 400 });
    }

    const getMeUrl = `https://api.telegram.org/bot${bot_token}/getMe`;
    const response = await fetch(getMeUrl);
    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: "Invalid bot token" }, { status: 400 });
    }

    const botUsername = data.result.username;

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/webhook/telegram?tenantId=${tenantId}`;

    const setWebhookUrl = `https://api.telegram.org/bot${bot_token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    await fetch(setWebhookUrl);

    const { data: existing } = await supabase
      .from("integrations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("provider", "telegram")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("integrations")
        .update({
          status: "active",
          enabled: true,
          credentials: { bot_token, bot_username: botUsername },
          connected_name: `@${botUsername}`,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("integrations").insert({
        tenant_id: tenantId,
        provider: "telegram",
        type: "telegram",
        status: "active",
        enabled: true,
        credentials: { bot_token, bot_username: botUsername },
        connected_name: `@${botUsername}`,
      });
    }

    log.info("Telegram integration connected", { tenantId, botUsername });

    return NextResponse.json({
      success: true,
      bot_username: botUsername,
      webhook_url: webhookUrl,
    });
  } catch (error: any) {
    console.error("Telegram integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();

    const { data: integration } = await supabase
      .from("integrations")
      .select("id, credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "telegram")
      .maybeSingle();

    if (integration?.credentials) {
      const credentials = integration.credentials as any;
      if (credentials.bot_token) {
        const deleteWebhookUrl = `https://api.telegram.org/bot${credentials.bot_token}/deleteWebhook`;
        await fetch(deleteWebhookUrl);
      }
    }

    await supabase
      .from("integrations")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("provider", "telegram");

    log.info("Telegram integration disconnected", { tenantId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete telegram integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
