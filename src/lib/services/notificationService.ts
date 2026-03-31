import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export type NotificationType = 
  | "new_customer"
  | "cross_channel_link"
  | "booking_confirmed"
  | "payment_received"
  | "kyc_submitted"
  | "ai_low_credits"
  | "message_received";

export interface NotificationPayload {
  type: NotificationType;
  tenantId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channel?: string;
  contactId?: string;
  guestId?: string;
}

export interface CustomerNotification {
  tenantId: string;
  isNewContact: boolean;
  wasLinked: boolean;
  linkedChannels: string[];
  contactId?: string;
  contactName?: string;
  channel: string;
}

export const NotificationService = {
  /**
   * Notify host about a new customer or cross-channel link
   */
  async notifyNewCustomer(payload: CustomerNotification): Promise<void> {
    const { tenantId, isNewContact, wasLinked, linkedChannels, contactId, contactName, channel } = payload;
    const supabase = await getSupabaseAdmin();

    const notifications: Partial<NotificationPayload>[] = [];

    if (isNewContact) {
      notifications.push({
        type: "new_customer",
        tenantId,
        title: `New customer from ${channel}`,
        message: `${contactName || "A new customer"} started a conversation via ${channel}`,
        data: { contactId, channel, contactName },
        channel
      });
    }

    if (wasLinked && linkedChannels.length > 0) {
      notifications.push({
        type: "cross_channel_link",
        tenantId,
        title: `Customer connected across channels`,
        message: `${contactName || "A customer"} is now connected via ${channel}. Already active on: ${linkedChannels.join(", ")}`,
        data: { contactId, channel, linkedChannels },
        channel
      });
    }

    for (const notification of notifications) {
      try {
        await this.sendNotification(supabase, notification as NotificationPayload);
      } catch (error) {
        log.error("Failed to send new customer notification:", error);
      }
    }
  },

  /**
   * Notify about booking confirmation
   */
  async notifyBookingConfirmed(tenantId: string, bookingData: {
    bookingId: string;
    guestName: string;
    amount: number;
    channel?: string;
    contactId?: string;
  }): Promise<void> {
    const supabase = await getSupabaseAdmin();

    await this.sendNotification(supabase, {
      type: "booking_confirmed",
      tenantId,
      title: "Booking Confirmed",
      message: `${bookingData.guestName} booked for ₹${bookingData.amount.toLocaleString()}`,
      data: bookingData,
      channel: bookingData.channel
    });
  },

  /**
   * Notify about payment received
   */
  async notifyPaymentReceived(tenantId: string, paymentData: {
    paymentId: string;
    amount: number;
    method: string;
    bookingId?: string;
    contactId?: string;
  }): Promise<void> {
    const supabase = await getSupabaseAdmin();

    await this.sendNotification(supabase, {
      type: "payment_received",
      tenantId,
      title: "Payment Received",
      message: `Payment of ₹${paymentData.amount.toLocaleString()} received via ${paymentData.method}`,
      data: paymentData
    });
  },

  /**
   * Notify about low AI credits
   */
  async notifyLowCredits(tenantId: string, currentBalance: number): Promise<void> {
    const supabase = await getSupabaseAdmin();

    await this.sendNotification(supabase, {
      type: "ai_low_credits",
      tenantId,
      title: "Low AI Credits",
      message: `Your AI credits balance is low (${currentBalance} remaining). Add credits to continue AI-powered automation.`,
      data: { currentBalance }
    });
  },

  /**
   * Notify about message received
   */
  async notifyMessageReceived(tenantId: string, messageData: {
    sender: string;
    preview: string;
    channel: string;
    contactId?: string;
    guestId?: string;
  }): Promise<void> {
    const supabase = await getSupabaseAdmin();

    await this.sendNotification(supabase, {
      type: "message_received",
      tenantId,
      title: `New message from ${messageData.channel}`,
      message: `${messageData.sender}: ${messageData.preview.slice(0, 50)}${messageData.preview.length > 50 ? "..." : ""}`,
      data: messageData,
      channel: messageData.channel,
      contactId: messageData.contactId,
      guestId: messageData.guestId
    });
  },

  /**
   * Core notification sender - stores in database and sends real-time update
   */
  async sendNotification(supabase: any, payload: NotificationPayload): Promise<string> {
    const { type, tenantId, title, message, data, channel, contactId, guestId } = payload;

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        tenant_id: tenantId,
        type,
        title,
        message,
        data,
        channel,
        contact_id: contactId,
        guest_id: guestId,
        read: false
      })
      .select("id")
      .single();

    if (error) {
      log.error("Failed to store notification:", error);
      throw error;
    }

    log.info(`Notification sent: ${type}`, { notificationId: notification.id, tenantId });

    return notification.id;
  },

  /**
   * Get unread notification count for a tenant
   */
  async getUnreadCount(tenantId: string): Promise<number> {
    const supabase = await getSupabaseAdmin();

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("read", false);

    if (error) {
      log.error("Failed to get unread count:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, tenantId: string): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("tenant_id", tenantId);

    if (error) {
      log.error("Failed to mark notification as read:", error);
      return false;
    }

    return true;
  },

  /**
   * Mark all notifications as read for a tenant
   */
  async markAllAsRead(tenantId: string): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq("read", false);

    if (error) {
      log.error("Failed to mark all notifications as read:", error);
      return false;
    }

    return true;
  },

  /**
   * Get recent notifications for a tenant
   */
  async getRecentNotifications(tenantId: string, limit: number = 20) {
    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      log.error("Failed to get notifications:", error);
      return [];
    }

    return data || [];
  }
};
