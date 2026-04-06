> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\api\channel-credentials\[id]\sync\route.ts` (Domain: **Generic Logic**)

### 🔴 Generic Logic Gotchas
- **⚠️ GOTCHA: Updated schema Promise**: -   { params }: { params: { id: string } }
+   { params }: { params: Promise<{ id: string }> }
-   try {
+   const { id } = await params;
-     const { error } = await supabase
+   try {
-       .from("blocked_dates")
+     const { error } = await supabase
-       .delete()
+       .from("blocked_dates")
-       .eq("id", params.id);
+       .delete()
- 
+       .eq("id", id);
-     if (error) throw error;
+ 
- 
+     if (error) throw error;
-     return NextResponse.json({ success: true });
+ 
-   } catch (error) {
+     return NextResponse.json({ success: true });
-     console.error("Error deleting blocked date:", error);
+   } catch (error) {
-     return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 });
+     console.error("Error deleting blocked date:", error);
-   }
+     return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 });
- }
+   }
+ }

📌 IDE AST Context: Modified symbols likely include [supabase, PATCH, DELETE]

### 📐 Generic Logic Conventions & Fixes
- **[decision] decision in route.ts**: File updated (external): src/app/api/blocked-dates/[id]/route.ts

Content summary (56 lines):
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { start_date, end_date, reason } = body;

    const updateData: Record<strin
- **[what-changed] what-changed in route.ts**: File updated (external): src/app/api/listings/[id]/sync/import/route.ts

Content summary (186 lines):

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseICal } from "@/lib/ical";
import { ListingPlatform } from "@/types";
import { WalletService } from "@/lib/services/walletService";
import { PricingService } from "@/lib/services/pricingService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(
  request: Request,
  
- **[convention] Fixed null crash in NextResponse — confirmed 3x**: -           await logEvent({
+         await logEvent({
-             tenant_id: tenantId as string,
+           tenant_id: tenantId as string,
-             actor_type: "system",
+           actor_type: "system",
-             event_type: EVENT_TYPES.AI_REPLY_SENT,
+           event_type: EVENT_TYPES.AI_REPLY_SENT,
-             entity_type: "message",
+           entity_type: "message",
-             metadata: { channel, trigger: "booking_confirmed" },
+           metadata: { channel, trigger: "booking_confirmed" },
-           });
+         });
-         }
+       }
-       }
+     }
-     }
+ 
- 
+     if (status === "refunded" && payment.booking_id) {
-     if (status === "refunded" && payment.booking_id) {
+       await supabase
-       await supabase
+         .from("bookings")
-         .from("bookings")
+         .update({ status: "refunded" })
-         .update({ status: "refunded" })
+         .eq("id", payment.booking_id as string);
-         .eq("id", payment.booking_id as string);
+ 
- 
+       await logEvent({
-       await logEvent({
+         tenant_id: tenantId as string,
-         tenant_id: tenantId as string,
+         actor_type: "system",
-         actor_type: "system",
+         event_type: EVENT_TYPES.BOOKING_CANCELLED,
-         event_type: EVENT_TYPES.BOOKING_CANCELLED,
+         entity_type: "booking",
-         entity_type: "booking",
+         entity_id: payment.booking_id as string,
-         entity_id: payment.booking_id as string,
+         metadata: { reason: "payment_refunded" },
-         metadata: { reason: "payment_refunded" },
+       });
-       });
+     }
-     }
+ 
- 
+     return NextResponse.json({ success: true });
-     return NextResponse.json({ success: true });
+   } catch (error: unknown) {
-   } catch (error: unknown) {
+     log.error("Payment webhook handling failed", error as Error);
-     log.error("Payment webhook handling failed", error as Error);
+     return NextResponse.json({ error: "Internal server error
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [Payload, POST, error, error, status]
- **[problem-fix] problem-fix in route.ts**: File updated (external): src/app/api/payments/webhook/route.ts

Content summary (211 lines):
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { log } from "@/lib/logger";
import { EVENT_TYPES } from "@/types/events";
import { ChannelService } from "@/lib/services/channelService";
import { FlowService } from "@/lib/services/flowService";
import { runBookingAutomation } from "@/lib/services/bookingAutomation";

type Payload = {
  paymentId?: string;
  status?: "paid" | "failed" | "expired"
- **[convention] what-changed in route.ts — confirmed 3x**: File updated (external): src/app/api/blocked-dates/route.ts

Content summary (69 lines):
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get("tenant_id");
    const listing_id = searchParams.get("listing_id");

    if (!tenant_id) {
      return NextResponse.json(
- **[what-changed] Updated milestones database schema — prevents null/undefined runtime crashes**: -   await supabase.from("listing_calendars").upsert({
+   // 1. Create Calendar Entry with tenant_id
-     listing_id: listingId,
+   const { error: calendarError } = await supabase.from("listing_calendars").upsert({
-     nodebase_ical_url: nodebaseIcalUrl
+     listing_id: listingId,
-   });
+     tenant_id: tenantId,
- 
+     nodebase_ical_url: nodebaseIcalUrl
-   if (integrations.length > 0) {
+   });
-     const payload = integrations.map((integration: any) => ({
+ 
-       listing_id: listingId,
+   if (calendarError) {
-       platform: integration.platform,
+     console.error("[Listings API] Error creating calendar entry:", calendarError);
-       external_ical_url: integration.externalIcalUrl || null,
+     // We continue as the listing itself was created, but log the error
-       last_synced_at: integration.lastSyncedAt || null,
+   }
-       status: integration.status || (integration.externalIcalUrl ? "connected" : "not_connected")
+ 
-     }));
+   // 2. Create Integrations with tenant_id
-     await supabase.from("listing_integrations").upsert(payload, { onConflict: "listing_id, platform" });
+   if (integrations.length > 0) {
-   }
+     const payload = integrations.map((integration: any) => ({
- 
+       listing_id: listingId,
-   // Mark Onboarding Milestones
+       tenant_id: tenantId,
-   try {
+       platform: integration.platform,
-     const { data: account } = await supabase.from("accounts").select("onboarding_milestones").eq("tenant_id", tenantId).single();
+       external_ical_url: integration.externalIcalUrl || null,
-     const currentMilestones = (account?.onboarding_milestones as string[]) || [];
+       last_synced_at: integration.lastSyncedAt || null,
-     const newMilestones = new Set(currentMilestones);
+       status: integration.status || (integration.externalIcalUrl ? "connected" : "not_connected")
-     newMilestones.add("first_listing");
+     }));
-     if (integrations.length > 0) newMilestones.add("connect_integration");
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getBaseUrl, GET, POST]
- **[what-changed] Added session cookies authentication**: -     id: data.id,
+     id: listingId,
-     userId: data.host_id,
+     userId: session.userId,
-     name: data.name,
+     name: listing.name,
-     city: data.city,
+     city: listing.city,
-     type: data.listing_type,
+     type: listing.type,
-     status: data.status,
+     status: listing.status || (integrations.length > 0 ? "active" : "incomplete"),
-     description: data.description,
+     description: listing.description || null,
-     images: data.images,
+     images: listing.images || [],
-     amenities: data.amenities,
+     amenities: listing.amenities || [],
-     createdAt: data.created_at,
+     createdAt: new Date().toISOString(),
-     maxGuests: data.max_guests,
+     maxGuests: listing.maxGuests || null,
-     checkInTime: data.check_in_time,
+     checkInTime: listing.checkInTime || null,
-     checkOutTime: data.check_out_time,
+     checkOutTime: listing.checkOutTime || null,
-     rules: data.rules,
+     rules: listing.rules || null,
-     basePrice: data.base_price,
+     basePrice: listing.basePrice || null,
-     internalNotes: data.internal_notes,
+     internalNotes: listing.internalNotes || null,

📌 IDE AST Context: Modified symbols likely include [getBaseUrl, POST]
- **[problem-fix] problem-fix in route.ts**: File updated (external): src/app/api/team/members/invite/route.ts

Content summary (162 lines):
import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getAppUrl } from "@/lib/runtime-config";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const admin = await getSupabaseAdmin();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
- **[what-changed] Replaced dependency BusinessType**: - import { BusinessType } from "@/types";
+ import { BusinessType, Tenant } from "@/types";

📌 IDE AST Context: Modified symbols likely include [fetchCurrentUser, getCachedUser, getCurrentUser, getCustomerProfile, getKaisaDashboardData]
- **[problem-fix] problem-fix in bookingAutomation.ts**: -   const { bookingId, tenantId, listingId, startDate, endDate } = options;
+   const { bookingId, tenantId, listingId, guestId, startDate, endDate } = options;
-       updateGuestLoyalty(tenantId, guestId),
+       guestId ? updateGuestLoyalty(tenantId, guestId) : Promise.resolve(),

📌 IDE AST Context: Modified symbols likely include [supabase, BookingAutomationOptions, runBookingAutomation, createCalendarBlock, createAutoTasks]
- **[decision] decision in bookingAutomation.ts**: File updated (external): src/lib/services/bookingAutomation.ts

Content summary (234 lines):
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BookingAutomationOptions {
  bookingId: string;
  tenantId: string;
  listingId: string;
  guestId: string;
  startDate: string;
  endDate: string;
}

export async function runBookingAutomation(options: BookingAutomationOptions) {
  const { bookingId, tenantId, listingId, startDate, endDate } = options;

  con
- **[what-changed] what-changed in business-context.ts**: -     bookings: true, // orders
+     bookings: true,
-     listings: true, // clinic
+     listings: true,
-     bookings: true, // appointments
+     bookings: true,
-     listings: true, // shop
+     listings: true,
-     bookings: true, // orders
+     bookings: true,

📌 IDE AST Context: Modified symbols likely include [PERSONA_LABELS, PersonaCapabilities, PERSONA_CAPABILITIES, PERSONA_AI_DEFAULTS, getBusinessLabels]
- **[what-changed] what-changed in business-context.ts**: File updated (external): src/lib/business-context.ts

Content summary (228 lines):
import { BusinessType } from "@/types";

export const PERSONA_LABELS: Record<BusinessType, {
  listing: string;
  listings: string;
  booking: string;
  bookings: string;
  calendar: string;
  customer: string;
  customers: string;
  checkIn: string;
  checkOut: string;
  emptyListings: string;
  emptyBookings: string;
  inboxContext: {
    customerLabel: string;
    timeLabel: string;
  };
}> = {
  airbnb_host: {
    listing: "Property",
    listings: "Properties",
    booking: "Booking",
    b
- **[what-changed] Replaced auth Host — formalizes the data contract with explicit types**: + // ==========================================
+ // Host AI Types
+ // ==========================================
+ 
+ export interface Review {
+   id: string;
+   tenant_id: string;
+   listing_id: string;
+   booking_id: string | null;
+   guest_id: string | null;
+   external_id: string | null;
+   platform: "airbnb" | "booking" | "mmt" | "google" | "direct";
+   rating: number;
+   title: string | null;
+   content: string | null;
+   response_text: string | null;
+   responded_at: string | null;
+   is_public: boolean;
+   received_at: string;
+   created_at?: string;
+ }
+ 
+ export interface Task {
+   id: string;
+   tenant_id: string;
+   listing_id: string;
+   booking_id: string | null;
+   title: string;
+   description: string | null;
+   type: "cleaning" | "maintenance" | "inspection" | "checkin" | "checkout" | "general";
+   status: "pending" | "in_progress" | "completed" | "cancelled";
+   priority: "low" | "normal" | "high" | "urgent";
+   assigned_to: string | null;
+   due_date: string;
+   completed_at: string | null;
+   created_at: string;
+ }
+ 
+ export interface BlockedDate {
+   id: string;
+   tenant_id: string;
+   listing_id: string;
+   start_date: string;
+   end_date: string;
+   reason: string | null;
+   created_at: string;
+ }
+ 
+ export interface GuestLoyalty {
+   id: string;
+   tenant_id: string;
+   guest_id: string;
+   guest_name?: string;
+   guest_phone?: string;
+   total_bookings: number;
+   total_spent: number;
+   loyalty_tier: "bronze" | "silver" | "gold" | "platinum";
+   points: number;
+   last_booking_at: string | null;
+ }
+ 
+ export interface ChannelCredential {
+   id: string;
+   tenant_id: string;
+   listing_id: string;
+   channel: "airbnb" | "booking" | "mmt" | "google" | "Vrbo" | "expedia";
+   credentials: Record<string, unknown> | null;
+   is_active: boolean;
+   last_sync_at: string | null;
+   sync_status: "idle" | "syncing" | "success" | "error";
+   error_message: string | null;
+ }
+ 
+ expor
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [Tenant, BusinessType, TenantUser, Host, ListingStatus]
