> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\lib\services\controlService.ts` (Domain: **Backend (API/Server)**)

### 📐 Backend (API/Server) Conventions & Fixes
- **[what-changed] what-changed in controlService.ts**: File updated (external): src/lib/services/controlService.ts

Content summary (547 lines):
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
- **[what-changed] what-changed in channelService.ts**: File updated (external): src/lib/services/channelService.ts

Content summary (142 lines):
import { wahaService } from "./wahaService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export type MessageChannel = 'whatsapp' | 'instagram' | 'messenger' | 'sms' | 'email';

export interface OutboundMessage {
  tenantId: string;
  recipientId: string; // phone number, IG handle, or Meta scoped ID
  content: string;
  channel: MessageChannel;
  metadata?: Record<string, any>;
}

export const ChannelService = {
  /**
   * Dispatches an outboun
- **[what-changed] what-changed in subscriptionService.ts**: File updated (external): src/lib/services/subscriptionService.ts

Content summary (116 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/types/events";
import { BusinessType } from "@/types";
import { 
  PLAN_LIMITS, 
  PLAN_PRICING, 
  BOOKING_MULTIPLIERS, 
  SubscriptionPlan 
} from "@/lib/constants/pricing";

export type { SubscriptionPlan };

export class SubscriptionService {
  static async getTenantPlan(tenantId: string): Promise<SubscriptionPlan> {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
   
- **[convention] Fixed null crash in Tenant — reduces initial bundle size with code splitting — confirmed 4x**: -         kyc_status: tenant.kyc_status || "not_started",
+         kyc_status: (tenant.kyc_status as import("@/types/index").Tenant["kyc_status"]) || "not_started",

📌 IDE AST Context: Modified symbols likely include [userService, mapDbUserToAppUser]
- **[convention] Strengthened types BusinessType — reduces initial bundle size with code split...**: -         businessType: tenant.business_type || "",
+         businessType: (tenant.business_type as import("@/types/index").BusinessType) || null,

📌 IDE AST Context: Modified symbols likely include [userService, mapDbUserToAppUser]
- **[what-changed] what-changed in userService.ts**: -       .update({ metadata: updatedMetadata })
+       .update({ metadata: updatedMetadata as unknown as Json })

📌 IDE AST Context: Modified symbols likely include [userService, mapDbUserToAppUser]
- **[decision] decision in userService.ts**: File updated (external): src/lib/services/userService.ts

Content summary (411 lines):
import {
  User,
  UserFilterOptions,
  AuditLog,
  AccountStatus,
  KYCStatus,
  KYCDocument,
  UserMetadata
} from "@/types/user";
import { DBUser, UserMetadataJSON } from "@/types/database";
import { type Json } from "@/types/supabase";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

// Service Methods

export const userService = {
  async getUsers(filters?: UserFilterOptions): Promise<User[]> {
    const supabase = await getSu
- **[what-changed] what-changed in settingsService.ts**: File updated (external): src/lib/services/settingsService.ts

Content summary (419 lines):
import { DEFAULT_AI_MODEL, DEFAULT_AI_PROVIDER } from "@/lib/ai/config";
import {
  AppSettings,
  SettingsAuditLog,
  IntegrationConfig,
  FeatureFlag,
  AuthSettings,
  PlatformSettings,
  NotificationSettings,
  SecuritySettings,
  ApiSettings,
} from "@/types/settings";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { cacheService } from "@/lib/services/cacheService";

function detectEnvironment(): "production" | "development" | "test" {
  if (process.env
- **[what-changed] what-changed in supabase.ts**: - ﻿export type Json =
+ export type Json =
- 
+ 
- 

📌 IDE AST Context: Modified symbols likely include [Json, Database, DatabaseWithoutInternals, DefaultSchema, Tables]
- **[decision] decision in supabase.ts**: File updated (external): src/types/supabase.ts

Content summary (3395 lines):
﻿export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          business_type: string | null
          created_at: string
          id: string
     
- **[convention] Fixed null crash in Supabase — externalizes configuration for environment fle... — confirmed 5x**: - import type { Database } from '@/types/supabase';
+ 
- 
+ export function getSupabaseAdmin() {
- export function getSupabaseAdmin() {
+   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
-   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
+   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";
-   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";
+ 
- 
+   if (supabaseUrl.includes("placeholder")) {
-   if (supabaseUrl.includes("placeholder")) {
+     console.error("[Supabase Admin Utility] CRITICAL: SUPABASE_URL is not configured.");
-     console.error("[Supabase Admin Utility] CRITICAL: SUPABASE_URL is not configured.");
+   }
-   }
+   if (supabaseServiceKey === "placeholder") {
-   if (supabaseServiceKey === "placeholder") {
+     console.error("[Supabase Admin Utility] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not configured.");
-     console.error("[Supabase Admin Utility] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not configured.");
+   }
-   }
+ 
- 
+   return createClient(supabaseUrl, supabaseServiceKey, {
-   return createClient<Database>(supabaseUrl, supabaseServiceKey, {
+     auth: {
-     auth: {
+       autoRefreshToken: false,
-       autoRefreshToken: false,
+       persistSession: false
-       persistSession: false
+     }
-     }
+   });
-   });
+ }
- }
+ 
- 

📌 IDE AST Context: Modified symbols likely include [getSupabaseAdmin]
- **[what-changed] Replaced auth Database**: - // ==========================================
+ 
- // Database Generic Supabase Shape
- // ==========================================
- export interface Database {
-   public: {
-     Tables: {
-       users: { Row: DBUser; Insert: Partial<DBUser>; Update: Partial<DBUser> };
-       profiles: { Row: DBProfile; Insert: Partial<DBProfile>; Update: Partial<DBProfile> };
-       kaisa_accounts: { Row: DBKaisaAccount; Insert: Partial<DBKaisaAccount>; Update: Partial<DBKaisaAccount> };
-       accounts: { Row: DBAccount; Insert: Partial<DBAccount>; Update: Partial<DBAccount> };
-       tenants: { Row: DBTenant; Insert: Partial<DBTenant>; Update: Partial<DBTenant> };
-       tenant_users: { Row: DBTenantUser; Insert: Partial<DBTenantUser>; Update: Partial<DBTenantUser> };
-       system_settings: { Row: { key: string; value: any; updated_by?: string; updated_at?: string }; Insert: any; Update: any };
-       kaisa_memories: { Row: any; Insert: any; Update: any };
-       admin_audit_logs: { Row: any; Insert: any; Update: any };
-       messages: { Row: DBMessage; Insert: Partial<DBMessage>; Update: Partial<DBMessage> };
-       wallet_transactions: { Row: DBWalletTransaction; Insert: Partial<DBWalletTransaction>; Update: Partial<DBWalletTransaction> };
-       guest_id_documents: { Row: any; Insert: any; Update: any };
-       kyc_documents: { Row: any; Insert: any; Update: any };
-       [key: string]: { Row: any; Insert: any; Update: any };
-     };
-     Views: Record<string, { Row: any; Insert: any; Update: any }>;
-     Functions: {
-       atomic_wallet_transaction_v1: {
-         Args: {
-           p_tenant_id: string;
-           p_amount: number;
-           p_action_type?: string;
-           p_type?: string;
-           p_model?: string;
-           p_tokens_used?: number;
-           p_metadata?: Record<string, any>;
-         };
-         Returns: { success: boolean; error?: string; code?: string; idempotent?: boolean };
-       };
-       [key: string]: { 
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [DBUser, UserMetadataJSON, KYCDocumentJSON, DBProfile, DBKaisaAccount]
- **[convention] Strengthened types DBMessage — ensures atomic multi-step database operations**: -       [key: string]: { Row: any; Insert: any; Update: any };
+       messages: { Row: DBMessage; Insert: Partial<DBMessage>; Update: Partial<DBMessage> };
-     };
+       wallet_transactions: { Row: DBWalletTransaction; Insert: Partial<DBWalletTransaction>; Update: Partial<DBWalletTransaction> };
-     Views: Record<string, { Row: any; Insert: any; Update: any }>;
+       guest_id_documents: { Row: any; Insert: any; Update: any };
-     Functions: Record<string, { Args: any; Returns: any }>;
+       kyc_documents: { Row: any; Insert: any; Update: any };
-     Enums: Record<string, any>;
+       [key: string]: { Row: any; Insert: any; Update: any };
-   };
+     };
- }
+     Views: Record<string, { Row: any; Insert: any; Update: any }>;
- 
+     Functions: {
+       atomic_wallet_transaction_v1: {
+         Args: {
+           p_tenant_id: string;
+           p_amount: number;
+           p_action_type?: string;
+           p_type?: string;
+           p_model?: string;
+           p_tokens_used?: number;
+           p_metadata?: Record<string, any>;
+         };
+         Returns: { success: boolean; error?: string; code?: string; idempotent?: boolean };
+       };
+       [key: string]: { Args: any; Returns: any };
+     };
+     Enums: Record<string, any>;
+   };
+ }
+ 

📌 IDE AST Context: Modified symbols likely include [DBUser, UserMetadataJSON, KYCDocumentJSON, DBProfile, DBKaisaAccount]
- **[problem-fix] problem-fix in withErrorHandler.ts**: - export function withErrorHandler(handler: Function) {
+ export function withErrorHandler(handler: (...args: any[]) => any) {

📌 IDE AST Context: Modified symbols likely include [withErrorHandler]
- **[convention] problem-fix in route.ts — confirmed 3x**: File updated (external): src/app/api/eyes/ingest/route.ts

Content summary (177 lines):
import { NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
import { rateLimit } from "@/lib/ratelimit";
import { withErrorHandler } from "@/lib/api/withErrorHandler";

/**
 * Camera ingest endpoint
 *
 * Accepts JSON:
 * {
 *   cameraId: string,             // required
 *   frameRef?: string,            // optional reference (if already uploaded)
 *   base64Frame?: stri
