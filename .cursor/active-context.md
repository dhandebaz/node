> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\api\listings\route.ts` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
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
- **[what-changed] what-changed in route.ts**: File updated (external): src/app/api/listings/create/route.ts

Content summary (115 lines):
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import { ReferralService } from "@/lib/services/referralService";

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const h
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
- **[convention] problem-fix in route.ts — confirmed 3x**: File updated (external): src/app/api/public/ical/[id]/route.ts

Content summary (79 lines):

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
  const supabase = await getSupabaseServer();

  // 1. Fetch Listing & Bookings
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("name, tenant_id")
    .eq("id", listingId)
    .single();

  if (listingE
- **[convention] Fixed null crash in System — confirmed 6x**: -             channel,
+             role: "assistant", // System automated assistant
-             direction: "outbound",
+             channel,
-             content,
+             direction: "outbound",
-             metadata: { read: false, trigger: "booking_confirmed" },
+             content,
-             created_at: new Date().toISOString(),
+             metadata: { read: false, trigger: "booking_confirmed" },
-           });
+             created_at: new Date().toISOString(),
- 
+           });
-           // Dispatch to external channel
+ 
-           try {
+           // Dispatch to external channel
-             await ChannelService.sendMessage({
+           try {
-               tenantId: tenantId as string,
+             await ChannelService.sendMessage({
-               recipientId: recipientId as string,
+               tenantId: tenantId as string,
-               content,
+               recipientId: recipientId as string,
-               channel: channel as any,
+               content,
-             });
+               channel: channel as any,
-           } catch (dispatchError) {
+             });
-             log.error("Dispatch confirmed message error", dispatchError, {
+           } catch (dispatchError) {
-               tenantId,
+             log.error("Dispatch confirmed message error", dispatchError, {
-               recipientId,
+               tenantId,
-               channel,
+               recipientId,
-             });
+               channel,
-           }
+             });
- 
+           }
-           // Log AI Reply Sent
+ 
-           await logEvent({
+           // Log AI Reply Sent
-             tenant_id: tenantId as string,
+           await logEvent({
-             actor_type: "system",
+             tenant_id: tenantId as string,
-             event_type: EVENT_TYPES.AI_REPLY_SENT,
+             actor_type: "system",
-             entity_type: "message",
+             event_type: EVENT_TYPES.AI_REPLY_SENT,
-          
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [Payload, POST]
- **[convention] what-changed in route.ts — confirmed 3x**: - }
+ }

📌 IDE AST Context: Modified symbols likely include [POST]
- **[convention] Added session cookies authentication — prevents null/undefined runtime crashes — confirmed 3x**: -           .eq("listing_id", listingId)
+           .eq("listing_id", listingId as string)
-           .eq("platform", platform);
+           .eq("platform", platform as string);
-       } catch (err: any) {
+       } catch (error: any) {
-         console.error(`[Sync Push] Failed for platform ${platform}:`, err);
+         console.error(`Push sync failed for ${platform}:`, error);
-         // Mark the integration as errored without failing the whole batch
+         // Update status to error
-             error_message: err.message || "Unknown error",
+             error_message: error.message || "Unknown sync error",
-           .eq("listing_id", listingId)
+           .eq("listing_id", listingId as string)
-           .eq("platform", platform);
+           .eq("platform", platform as string);
-         results.push({ platform, imported: 0, error: err.message });
+         results.push({ platform, imported: 0, error: error.message });
-     const syncedCount = results.filter((r) => !r.error).length;
+     // 4. Update overall listing last_synced_at
-     const errorCount = results.filter((r) => !!r.error).length;
+     await supabase
- 
+       .from("listings")
-     await logEvent({
+       .update({ last_synced_at: new Date().toISOString() })
-       tenant_id: tenantId,
+       .eq("id", listingId as string);
-       actor_type: "user",
+ 
-       actor_id: session.userId,
+     const syncedCount = results.filter((r) => !r.error).length;
-       event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
+     const errorCount = results.filter((r) => !!r.error).length;
-       entity_type: "listing",
+ 
-       entity_id: listingId,
+     await logEvent({
-       metadata: {
+       tenant_id: tenantId,
-         type: "push_sync",
+       actor_type: "user",
-         results,
+       actor_id: session.userId,
-         synced: syncedCount,
+       event_type: EVENT_TYPES.SYSTEM_CALENDAR_SYNC,
-         errors: errorCount,
+
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [POST]
- **[convention] problem-fix in route.ts — confirmed 5x**: -     const portalData = (await admin.rpc(
+     const { data: portalData, error: rpcError } = await admin.rpc(
-     )).data as any;
+     ) as { data: any, error: any };

📌 IDE AST Context: Modified symbols likely include [runtime, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, isValidUuid, isValidMagicBytes]
- **[convention] what-changed in route.ts — confirmed 4x**: File updated (external): src/app/api/kyc/[token]/documents/route.ts

Content summary (313 lines):
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";
import { KycService, maskAadhaar, GuestDocumentType } from "@/lib/services/kycService";
import { log } from "@/lib/logger";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE_BYTES = 10 * 
- **[what-changed] Updated schema Reply — prevents null/undefined runtime crashes**: -     const prompt = [
+     const aiSettings = tenant?.ai_settings as any;
-       `You are an AI assistant for a ${tenant?.business_type || "business"}.`,
+ 
-       getToneInstruction(tenant?.ai_settings?.tone),
+     const prompt = [
-       tenant?.ai_settings?.customInstructions?.trim(),
+       `You are an AI assistant for a ${tenant?.business_type || "business"}.`,
-       `Reply to this customer message: ${text}`,
+       getToneInstruction(aiSettings?.tone),
-     ].filter(Boolean).join(" ");
+       aiSettings?.customInstructions?.trim(),
- 
+       `Reply to this customer message: ${text}`,
-     const { text: aiReply, usage } = await generateText({
+     ].filter(Boolean).join(" ");
-       model: kaisaRuntime.model,
+ 
-       prompt,
+     const { text: aiReply, usage } = await generateText({
-     });
+       model: kaisaRuntime.model,
- 
+       prompt,
-     // 4. Record and Dispatch Outbound
+     });
-     await supabase.from("messages").insert({
+ 
-       tenant_id: tenantId,
+     // 4. Record and Dispatch Outbound
-       guest_id: guestId,
+     await supabase.from("messages").insert({
-       direction: "outbound",
+       tenant_id: tenantId,
-       role: "assistant",
+       guest_id: guestId,
-       channel: channel,
+       direction: "outbound",
-       content: aiReply,
+       role: "assistant",
-       created_at: new Date().toISOString(),
+       channel: channel,
-       metadata: { read: true }
+       content: aiReply,
-     });
+       created_at: new Date().toISOString(),
- 
+       metadata: { read: true }
-     // Dispatch via ChannelService (uses Meta Graph API Send endpoint)
+     });
-     await ChannelService.sendMessage({
+ 
-       tenantId,
+     // Dispatch via ChannelService (uses Meta Graph API Send endpoint)
-       recipientId: senderId,
+     await ChannelService.sendMessage({
-       content: aiReply,
+       tenantId,
-       channel: channel as 'instagram' | 'messenger'
+       recipientId: senderId,
-     
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [GET, POST]
- **[convention] problem-fix in route.ts — confirmed 6x**: File updated (external): src/app/api/admin/integrations/health/route.ts

Content summary (73 lines):
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const now = new Date();

    const [{ data: integrations, error: integrationsError }, { data: logs, error: logsError }] = await Promise.all([
      supabase
        .from("integrations")
        .select("provider, status, last_synced_at
- **[convention] problem-fix in route.ts — confirmed 3x**: File updated (external): src/app/api/guest-id/reject/[id]/route.ts

Content summary (70 lines):
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getTenantIdForUser } from "@/app/actions/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

  
- **[convention] what-changed in route.ts — confirmed 4x**: File updated (external): src/app/api/payments/create-link/route.ts

Content summary (329 lines):
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { ControlService } from "@/lib/services/controlService";
import { RazorpayService } from "@/lib/services/razorpayService";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import { get
- **[convention] problem-fix in route.ts — confirmed 3x**: File updated (external): src/app/api/guest-id/approve/[id]/route.ts

Content summary (73 lines):
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getTenantIdForUser } from "@/app/actions/auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

 
- **[convention] problem-fix in route.ts — confirmed 4x**: File updated (external): src/app/api/failures/route.ts

Content summary (82 lines):
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ControlService } from "@/lib/services/controlService";
import { FailureRecord } from "@/types/failure";
import { requireActiveTenant } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorize
