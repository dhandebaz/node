import { NextRequest, NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { whatsappBusinessService } from "@/lib/services/whatsappBusinessService";

const GRAPH_API_VERSION = "v21.0";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();

    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status, credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    const credentials = integration.credentials as any;
    
    return NextResponse.json({
      connected: integration.status === "active",
      phone_number_id: credentials?.phone_number_id ? "***" + credentials.phone_number_id.slice(-4) : undefined,
      business_account_id: credentials?.business_account_id,
    });
  } catch (error: any) {
    console.error("Get WhatsApp integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();
    const body = await request.json();

    const { access_token, phone_number_id, business_account_id } = body;

    if (!access_token || !phone_number_id) {
      return NextResponse.json({ error: "Access token and Phone Number ID are required" }, { status: 400 });
    }

    // Verify the credentials work
    const result = await whatsappBusinessService.getPhoneNumber(phone_number_id, {
      accessToken: access_token,
      phoneNumberId: phone_number_id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Invalid credentials" }, { status: 400 });
    }

    const phoneInfo = result.data;
    const verifiedNumber = phoneInfo.verified_name || `Phone ${phone_number_id.slice(-4)}`;

    // Register webhook
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
    const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN;

    // Set up webhook via Graph API
    try {
      await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phone_number_id}/webhooks`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incoming_phone_number_webhook: {
              value: {
                address: webhookUrl,
                verify_token: verifyToken,
              },
            },
          }),
        }
      );
    } catch (e) {
      log.warn("Failed to set webhook via API, webhook URL may need manual configuration");
    }

    // Check if integration exists
    const { data: existing } = await supabase
      .from("integrations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("integrations")
        .update({
          status: "active",
          enabled: true,
          credentials: {
            access_token,
            phone_number_id,
            business_account_id,
          },
          connected_name: verifiedNumber,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("integrations").insert({
        tenant_id: tenantId,
        provider: "whatsapp",
        type: "whatsapp",
        status: "active",
        enabled: true,
        credentials: {
          access_token,
          phone_number_id,
          business_account_id,
        },
        connected_name: verifiedNumber,
      });
    }

    log.info("WhatsApp Business API integration connected", { tenantId, phoneNumberId: phone_number_id });

    return NextResponse.json({
      success: true,
      phone_number: verifiedNumber,
      webhook_url: webhookUrl,
    });
  } catch (error: any) {
    console.error("WhatsApp integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseAdmin();

    // Get current credentials
    const { data: integration } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp")
      .maybeSingle();

    // Remove webhook subscription if we have credentials
    if (integration?.credentials) {
      const credentials = integration.credentials as any;
      try {
        await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${credentials.phone_number_id}/webhooks`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${credentials.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              incoming_phone_number_webhook: {
                value: {
                  fields: ["messages"],
                },
              },
            }),
          }
        );
      } catch (e) {
        log.warn("Failed to remove webhook subscription");
      }
    }

    // Delete integration
    await supabase
      .from("integrations")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp");

    log.info("WhatsApp integration disconnected", { tenantId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete WhatsApp integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
