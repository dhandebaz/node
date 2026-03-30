> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\api\integrations\google\connect\route.ts` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in route.ts**: File updated (external): src/app/api/inbox/context/route.ts

Content summary (135 lines):
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const contextMap: Record<string, any> = {
  "conv-1001": {
    role: "Host AI",
    managerName: "Host AI",
    status: "pending",
    updatedAt: new Date().toISOString(),
    fields: [
      { label: "Listing", value: "Sea Breeze Villa" },
      { label: "Dates", value: "12–15 Oct" },
      { label: "Availability", value: "Open", tone: "good" },
      { label: "Booking", value: "
- **[problem-fix] problem-fix in route.ts**: File updated (external): src/app/api/host/me/route.ts

Content summary (74 lines):
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const [{ data:
- **[problem-fix] problem-fix in route.ts**: File updated (external): src/app/api/guest-id/upload/route.ts

Content summary (131 lines):
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { saveEncryptedImage } from "@/lib/guestIdStorage";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const { data: re
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
- **[problem-fix] problem-fix in billing.ts**: File updated (external): src/types/billing.ts

Content summary (69 lines):

export type PaymentProvider = 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BillingInterval = 'month' | 'year' | 'one_time';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';

import { Json } from './supabase';

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  interval: string | null;
  product: strin
- **[what-changed] Added session cookies authentication — formalizes the data contract with expl...**: -   tenant_id: string;
+   tenant_id: string | null;
-   guest_id?: string;
+   listing_id: string | null;
-   amount: number;
+   guest_id: string | null;
-   source?: string;
+   amount: number | null;
-   status: string;
+   status: string | null;
-   check_in?: string;
+   check_in: string | null;
-   check_out?: string;
+   check_out: string | null;
-   created_at: string;
+   start_date: string | null;
-   metadata?: Record<string, unknown>;
+   end_date: string | null;
- }
+   source: string | null;
- 
+   id_status: string | null;
- export interface DBReferral {
+   guest_contact: string | null;
-   id: string;
+   payment_id: string | null;
-   referrer_id: string;
+   metadata: Json | null;
-   referred_id: string;
+   created_at: string | null;
-   status: string;
+ }
-   created_at: string;
+ 
- }
+ export interface DBReferral {
- 
+   id: string;
- export interface DBSupportTicket {
+   referrer_id: string;
-   id: string;
+   referred_id: string;
-   user_id: string;
+   status: string;
-   subject: string;
+   created_at: string;
-   product?: string;
+ }
-   status: string;
+ 
-   priority: string;
+ export interface DBSupportTicket {
-   created_at: string;
+   id: string;
-   updated_at: string;
+   user_id: string;
- }
+   subject: string;
- 
+   product?: string;
- export interface DBMessage {
+   status: string;
-   id: string;
+   priority: string;
-   tenant_id: string | null;
+   created_at: string;
-   conversation_id: string | null;
+   updated_at: string;
-   guest_id: string | null;
+ }
-   listing_id: string | null;
+ 
-   role: string;
+ export interface DBMessage {
-   direction: string | null;
+   id: string;
-   content: string | null;
+   tenant_id: string | null;
-   channel: string | null;
+   conversation_id: string | null;
-   external_id: string | null;
+   guest_id: string | null;
-   metadata: Json | null;
+   listing_id: string | null;
-   created_at: string | null;
+   role: string;
- }
+   direction: string | null;
- 
+   
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [Json, DBUser, UserMetadataJSON, KYCDocumentJSON, DBProfile]
- **[convention] what-changed in database.ts — confirmed 4x**: -   metadata?: Record<string, unknown>;
+   metadata: Json | null;
-   is_active: boolean;
+   is_active: boolean | null;
-   resolved_at?: string;
+   resolved_at: string | null;
-   created_at: string;
+   created_at: string | null;

📌 IDE AST Context: Modified symbols likely include [Json, DBUser, UserMetadataJSON, KYCDocumentJSON, DBProfile]
- **[convention] Strengthened types Alias**: -     businessType: dbTenant.business_type // Alias for easier access
+     businessType: dbTenant.business_type as any // Alias for easier access

📌 IDE AST Context: Modified symbols likely include [getActiveTenantId, requireActiveTenant, getTenantContext, validateTenantAccess]
- **[what-changed] Added Supabase Auth authentication — formalizes the data contract with explic...**: - 
+ import { DBTenant } from '@/types/database';
- /**
+ 
-  * Gets the full tenant context including business type.
+ /**
-  * Useful for checking business rules without needing full user profile.
+  * Gets the full tenant context including business type.
-  */
+  * Useful for checking business rules without needing full user profile.
- export async function getTenantContext(tenantId: string): Promise<(Tenant & DBTenant) | null> {
+  */
-   const supabase = await getSupabaseServer();
+ export async function getTenantContext(tenantId: string): Promise<(Tenant & DBTenant) | null> {
-   const { data: tenant, error } = await supabase
+   const supabase = await getSupabaseServer();
-     .from("tenants")
+   const { data: tenant, error } = await supabase
-     .select("*")
+     .from("tenants")
-     .eq("id", tenantId)
+     .select("*")
-     .single();
+     .eq("id", tenantId)
-     
+     .single();
-   if (error || !tenant) return null;
+     
-   
+   if (error || !tenant) return null;
-   const dbTenant = tenant as unknown as DBTenant;
+   
-   
+   const dbTenant = tenant as unknown as DBTenant;
-   return {
+   
-     ...dbTenant,
+   return {
-     ownerUserId: dbTenant.owner_user_id, // Map for Tenant interface compatibility
+     ...dbTenant,
-     createdAt: dbTenant.created_at,       // Map for Tenant interface compatibility
+     ownerUserId: dbTenant.owner_user_id, // Map for Tenant interface compatibility
-     businessType: dbTenant.business_type // Alias for easier access
+     createdAt: dbTenant.created_at,       // Map for Tenant interface compatibility
-   };
+     businessType: dbTenant.business_type // Alias for easier access
- }
+   };
- 
+ }
- /**
+ 
-  * Validates that the current user actually has access to the requested tenant.
+ /**
-  * Useful for critical operations where we don't want to rely solely on RLS for the 'active' check.
+  * Validates that the current user actually has access to the requested tenant.
-  */
+  * Useful for c
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getActiveTenantId, requireActiveTenant, getTenantContext, validateTenantAccess]
- **[what-changed] Replaced dependency Tenant**: - import { DBTenant } from '@/types/database';
+ import { Tenant } from '@/types';
- export async function getTenantContext(tenantId: string): Promise<(DBTenant & { ownerUserId: string; createdAt: string; businessType?: string | null }) | null> {
+ export async function getTenantContext(tenantId: string): Promise<(Tenant & DBTenant) | null> {

📌 IDE AST Context: Modified symbols likely include [getActiveTenantId, requireActiveTenant, getTenantContext, validateTenantAccess]
- **[what-changed] what-changed in index.ts**: -   };
+   } | null;

📌 IDE AST Context: Modified symbols likely include [Tenant, BusinessType, TenantUser, Host, ListingStatus]
- **[what-changed] what-changed in index.ts**: -   address?: string;
+   address?: string | null;
-   tax_id?: string;
+   tax_id?: string | null;
-   phone?: string;
+   phone?: string | null;
-   timezone?: string;
+   timezone?: string | null;
-   username?: string;
+   username?: string | null;
-     tone?: AITone;
+     tone?: AITone | null;

📌 IDE AST Context: Modified symbols likely include [Tenant, BusinessType, TenantUser, Host, ListingStatus]
