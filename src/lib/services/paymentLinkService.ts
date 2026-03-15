import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { AppError, ErrorCode } from "@/lib/errors";
import { getAppUrl } from "@/lib/runtime-config";

export class PaymentLinkService {
  /**
   * Create a secure payment link for a conversation.
   */
  static async createLink(params: {
    tenantId: string;
    conversationId: string;
    listingId?: string;
    amount: number;
    expiresInMinutes?: number;
    metadata?: any;
  }) {
    if (params.amount < 0) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        "Payment amount cannot be negative",
      );
    }

    const supabase = await getSupabaseServer();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (params.expiresInMinutes || 60),
    );

    const { data, error } = await supabase
      .from("payment_links")
      .insert({
        tenant_id: params.tenantId,
        conversation_id: params.conversationId,
        listing_id: params.listingId,
        amount: params.amount,
        expires_at: expiresAt.toISOString(),
        metadata: params.metadata || {},
        status: "active",
      })
      .select()
      .single();

    if (error) {
      log.error("Failed to create payment link", error, {
        tenantId: params.tenantId,
      });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to generate payment link",
      );
    }

    // In a real system, we'd also create a Razorpay/Stripe order here
    // and store the external_order_id.

    const baseUrl = getAppUrl();
    const checkoutUrl = `${baseUrl}/book/${data.id}`;

    return {
      ...data,
      checkoutUrl,
    };
  }

  /**
   * Get payment link details for the public checkout page.
   */
  static async getLinkDetails(id: string) {
    const supabase = await getSupabaseAdmin(); // Public access for checkout
    const { data, error } = await supabase
      .from("payment_links")
      .select(
        "*, tenants(name, business_qr_url, upi_id), listings(title, base_price)",
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    // Check expiry
    if (new Date(data.expires_at) < new Date() && data.status === "active") {
      await supabase
        .from("payment_links")
        .update({ status: "expired" })
        .eq("id", id);
      data.status = "expired";
    }

    return data;
  }
}
