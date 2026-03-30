> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\lib\services\controlService.ts` (Domain: **Backend (API/Server)**)

### 🔴 Backend (API/Server) Gotchas
- **⚠️ GOTCHA: Updated schema Date**: -         const start = new Date(b.start_date);
+         if (!b.start_date || !b.end_date) return false;
-         const end = new Date(b.end_date);
+         const start = new Date(b.start_date);
-         return targetDate >= start && targetDate < end;
+         const end = new Date(b.end_date);
-       });
+         return targetDate >= start && targetDate < end;
- 
+       });
-       if (isBooked) continue;
+ 
- 
+       if (isBooked) continue;
-       let multiplier = 1.0;
+ 
-       let reason = "Base price applied.";
+       let multiplier = 1.0;
- 
+       let reason = "Base price applied.";
-       // Strategy: Balanced
+ 
-       // Weekend markup
+       // Strategy: Balanced
-       if (isWeekend) {
+       // Weekend markup
-         multiplier *= settings.weekend_markup || 1.2;
+       if (isWeekend) {
-         reason = "Weekend demand surge.";
+         multiplier *= settings.weekend_markup || 1.2;
-       }
+         reason = "Weekend demand surge.";
- 
+       }
-       // Last minute discount (next 3 days)
+ 
-       if (i <= 3) {
+       // Last minute discount (next 3 days)
-         multiplier *= settings.last_minute_discount || 0.8;
+       if (i <= 3) {
-         reason = "Last-minute occupancy boost.";
+         multiplier *= settings.last_minute_discount || 0.8;
-       }
+         reason = "Last-minute occupancy boost.";
- 
+       }
-       // Proximity to other bookings (Fill the gaps)
+ 
-       // (Skipped for simplicity, but could be added here)
+       // Proximity to other bookings (Fill the gaps)
- 
+       // (Skipped for simplicity, but could be added here)
-       const suggestedPrice = Math.round(basePrice * multiplier);
+ 
- 
+       const suggestedPrice = Math.round(basePrice * multiplier);
-       // Clamp to min/max
+ 
-       const finalPrice = Math.min(
+       // Clamp to min/max
-         Math.max(suggestedPrice, settings.min_price || 0),
+       const final
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [PriceSuggestion, DynamicPricingSettings, RevenueService]

### 📐 Backend (API/Server) Conventions & Fixes
- **[problem-fix] problem-fix in controlService.ts**: -     const { error } = await supabase.from("system_settings").upsert({
+     const { error } = await supabase.from("system_flags").upsert([{
-       key: key,
+       key,
-     });
+     }]);

📌 IDE AST Context: Modified symbols likely include [SystemFlagKey, TenantControlKey, ActionBlockedError, createActionBlockedError, PostgrestResponse]
- **[problem-fix] problem-fix in controlService.ts**: -   description: string | null;
+   description?: string | null;
-   updated_at: string | null;
+   updated_at?: string | null;
-   updated_by: string | null;
+   updated_by?: string | null;
-     const { error } = await supabase.from("system_flags").upsert([{
+     const { error } = await supabase.from("system_settings").upsert({
-       key,
+       key: key,
-       value,
+       value: value as any,
-     }]);
+     });

📌 IDE AST Context: Modified symbols likely include [SystemFlagKey, TenantControlKey, ActionBlockedError, createActionBlockedError, PostgrestResponse]
- **[what-changed] what-changed in controlService.ts**: File updated (external): src/lib/services/controlService.ts

Content summary (562 lines):
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { getPersonaCapabilities } from "@/lib/business-context";
import { BusinessType } from "@/types";
import { hasRazorpayCredentials } from "@/lib/runtime-config";

export type SystemFlagKey =
  | "ai_global_enabled"
  | "bookings_global_enabled"
  | "incident_mode_enabled"
  | "messaging_global_enabled"
  | "payments_global_enabl
- **[what-changed] what-changed in adminService.ts**: File updated (external): src/lib/services/adminService.ts

Content summary (118 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_PRICING, SubscriptionPlan } from "@/lib/constants/pricing";

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number; // Simple MRR estimate
  walletBalances: number; // Total outstanding wallet credits (liability)
}

export interface CustomerSummary {
  id: string;
  phone: string;
  email: string | null;
  plan: string;
  businessType: string;
  joinedAt: string;
  walletB
- **[what-changed] what-changed in growthService.ts**: -       .eq('external_id', externalId)
+       .eq('external_id', externalId || "")

📌 IDE AST Context: Modified symbols likely include [GrowthOpportunity, GrowthService]
- **[what-changed] what-changed in analyticsService.ts**: File updated (external): src/lib/services/analyticsService.ts

Content summary (334 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import { PricingService } from "./pricingService";

export type TimeRange = 'today' | '7d' | '30d';

export interface PersonaMetrics {
  // Airbnb
  occupancyRate?: number;
  revenue?: number;
  directBookings?: number;
  otaBookings?: number;
  avgResponseTime?: number; // in minutes
  aiAssistedBookings?: number;

  // Kirana
  ordersCount?: number;
  repeatCustomers?
- **[what-changed] what-changed in invoiceService.ts**: File updated (external): src/lib/services/invoiceService.ts

Content summary (114 lines):
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { DBInvoice, DBTenant } from "@/types/database";

export class InvoiceService {
  static async generatePDF(
    invoice: DBInvoice,
    tenant: DBTenant,
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header - Brand
    doc.setFontSize(24);
    doc.setTextColor(235, 68, 90); // Brand Red
    doc.text("KAISA", margin, margin + 10);

   
- **[problem-fix] problem-fix in inboxService.ts**: File updated (external): src/lib/services/inboxService.ts

Content summary (120 lines):

import { getSupabaseServer } from "@/lib/supabase/server";
import { Conversation, MessageChannel, MessageDirection } from "@/types/omnichannel";
import { log } from "@/lib/logger";

export class InboxService {
  /**
   * Get all conversations for a tenant, ordered by last message
   */
  static async getConversations(tenantId: string): Promise<Conversation[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("conversations")
      .select("
- **[what-changed] what-changed in growthService.ts**: -           contact_name: guest.name,
+           contact_name: guest.name || "",
-       guestId: opportunity.guest_id,
+       guestId: opportunity.guest_id || "",

📌 IDE AST Context: Modified symbols likely include [GrowthOpportunity, GrowthService]
- **[what-changed] what-changed in kaisaMemoryService.ts**: -       source: data.source || "",
+       source: (data.source as any) || "",

📌 IDE AST Context: Modified symbols likely include [kaisaMemoryService]
- **[what-changed] what-changed in knowledgeService.ts**: -         query_embedding: queryEmbedding,
+         query_embedding: `[${queryEmbedding.join(",")}]`,

📌 IDE AST Context: Modified symbols likely include [KnowledgeService]
- **[problem-fix] problem-fix in pricingService.ts**: File updated (external): src/lib/services/pricingService.ts

Content summary (106 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { AppError, ErrorCode } from "@/lib/errors";
import { log } from "@/lib/logger";

export interface PricingRules {
  per_1k_tokens: number;
  action_multipliers: Record<string, number>;
  persona_multipliers?: Record<string, number>;
  ai_monthly_price?: number;
  ai_message_cost?: number;
}

const DEFAULT_PRICING: PricingRules = {
  per_1k_tokens: 0.002,
  action_multipliers: {
    ai_reply: 1.0,
    availability_check: 2.0,
    c
- **[convention] Fixed null crash in Failed — parallelizes async operations for speed — confirmed 3x**: -     if (!data?.value) return DEFAULT_PRICING;
+     if (error || !request) {
-     // Merge with default to ensure new fields exist if old data
+       log.error("Failed to create KYC request", error, { tenantId });
-     return { ...DEFAULT_PRICING, ...(data.value as any) } as PricingRules;
+       throw new AppError(
-   }
+         ErrorCode.INTERNAL_ERROR,
- 
+         "Failed to create KYC request",
-   /**
+       );
-    * Returns all KYC requests for a tenant, newest first.
+     }
-    * Optionally filtered by status and/or limited in count.
+     return request as GuestKycRequest;
-    */
+   }
-   static async listKycRequests(
+ 
-     tenantId: string,
+   /**
-     options?: { status?: KycRequestStatus; limit?: number },
+    * Returns all KYC requests for a tenant, newest first.
-   ): Promise<GuestKycRequest[]> {
+    * Optionally filtered by status and/or limited in count.
-     const supabase = await getSupabaseServer();
+    */
-     let query = supabase
+   static async listKycRequests(
-       .from("guest_kyc_requests")
+     tenantId: string,
-       .select("*")
+     options?: { status?: KycRequestStatus; limit?: number },
-       .eq("tenant_id", tenantId)
+   ): Promise<GuestKycRequest[]> {
-       .order("created_at", { ascending: false });
+     const supabase = await getSupabaseServer();
- 
+     let query = supabase
-     if (options?.status) query = query.eq("status", options.status);
+       .from("guest_kyc_requests")
-     if (options?.limit) query = query.limit(options.limit);
+       .select("*")
- 
+       .eq("tenant_id", tenantId)
-     const { data, error } = await query;
+       .order("created_at", { ascending: false });
-     if (error) {
+ 
-       log.error("Failed to list KYC requests", error, { tenantId });
+     if (options?.status) query = query.eq("status", options.status);
-       return [];
+     if (options?.limit) query = query.limit(options.limit);
-     }
+ 
-     return (data ?? []) as GuestKycRequest[];
+  
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [KycRequestStatus, GuestDocumentType, DocumentVerificationStatus, ConsentForm, GuestKycRequest]
- **[decision] decision in revenueService.ts**: File updated (external): src/lib/services/revenueService.ts

Content summary (185 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export interface PriceSuggestion {
  date: string;
  suggestedPrice: number;
  currentPrice: number;
  reason: string;
  confidence: number;
}

export interface DynamicPricingSettings {
  base_price?: number;
  weekend_markup?: number;
  last_minute_discount?: number;
  min_price?: number;
  max_price?: number;
}

export class RevenueService {
  /**
   * Analyze occupancy and sugg
