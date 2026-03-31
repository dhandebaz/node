import { NextRequest, NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { NotificationService } from "@/lib/services/notificationService";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = await NotificationService.getRecentNotifications(tenantId, limit);
    const unreadCount = await NotificationService.getUnreadCount(tenantId);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const body = await request.json();

    // Mark all as read
    if (body.action === "markAllRead") {
      await NotificationService.markAllAsRead(tenantId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Notification action error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
