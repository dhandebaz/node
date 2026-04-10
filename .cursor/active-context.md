> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\actions\whatsapp.ts` (Domain: **Generic Logic**)

### 🔴 Generic Logic Gotchas
- **⚠️ GOTCHA: Fixed null crash in OmniGlobalConfig — filters out falsy/null values explicitly**: - import {
+ import {
-     KaisaGlobalConfig,
+     OmniGlobalConfig,
-     KaisaRoleType,
+     OmniRoleType,
-     KaisaModuleType,
+     OmniModuleType,
-     KaisaBusinessType,
+     OmniBusinessType,
-     IntegrationConfigDetails
+     IntegrationConfigDetails
- } from "@/types/omni";
+ } from "@/types/omni";
- import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
+ import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
- import { logEvent } from "@/lib/events";
+ import { logEvent } from "@/lib/events";
- import { EVENT_TYPES, EventType } from "@/types/events";
+ import { EVENT_TYPES, EventType } from "@/types/events";
- import { log } from "@/lib/logger";
+ import { log } from "@/lib/logger";
- 
+ 
- const OMNI_CONFIG_KEY = "OMNI_GLOBAL_CONFIG";
+ const OMNI_CONFIG_KEY = "OMNI_GLOBAL_CONFIG";
- 
+ 
- // Initial Config (Default if DB is empty)
+ // Initial Config (Default if DB is empty)
- const DEFAULT_GLOBAL_CONFIG: KaisaGlobalConfig = {
+ const DEFAULT_GLOBAL_CONFIG: OmniGlobalConfig = {
-     systemStatus: "operational",
+     systemStatus: "operational",
-     roles: [
+     roles: [
-         { type: "owner", priceMonthly: 0, enabled: true, inviteOnly: false },
+         { type: "owner", priceMonthly: 0, enabled: true, inviteOnly: false },
-         { type: "manager", priceMonthly: 299, enabled: true, inviteOnly: false },
+         { type: "manager", priceMonthly: 299, enabled: true, inviteOnly: false },
-         { type: "co-founder", priceMonthly: 999, enabled: true, inviteOnly: true },
+         { type: "co-founder", priceMonthly: 999, enabled: true, inviteOnly: true },
-     ],
+     ],
-     modules: [
+     modules: [
-         { type: "Frontdesk", enabledGlobal: true, enabledFor: ["Doctor", "Homestay", "Retail", "Other"] },
+         { type: "Frontdesk", enabledGlobal: true, enabledFor: ["Doctor", "Homestay", "Retail", "Other"] },
-         { type: "Billing", enabledGlobal: tru
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [OMNI_CONFIG_KEY, DEFAULT_GLOBAL_CONFIG, logAction, omniConfigService]

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in whatsapp.ts**: File updated (external): src/app/actions/whatsapp.ts

Content summary (71 lines):
"use server";

import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { wahaService } from "@/lib/services/wahaService";
import { getAppUrl } from "@/lib/runtime-config";

export async function generateWhatsAppQRAction() {
  const tenantId = await requireActiveTenant();

  try {
    const supabase = await getSupabaseServer();
    const webhookUrl = `${getAppUrl()}/api/integrations/webhook/whatsapp?tenantId=${tenantId}`;
    cons
- **[what-changed] what-changed in payments.ts**: File updated (external): src/app/actions/payments.ts

Content summary (100 lines):

'use server';

import { requireActiveTenant } from "@/lib/auth/tenant";
import { PaymentLinkService } from "@/lib/services/paymentLinkService";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function createBookingLinkAction(params: {
  conversationId: string;
  listingId?: string;
  amount: number;
  metadata?: any;
}) {
  const tenantId = await requireActiveTenant();
  
  const result = await PaymentLinkService.createLink({
- **[what-changed] what-changed in omni-core.ts**: -       });
+       } as any);

📌 IDE AST Context: Modified symbols likely include [createOmniAccount, getOmniAccount, getOmniTasks, createOmniTask, updateOmniTaskStatus]
- **[what-changed] Added session cookies authentication**: -         user_id: session.userId,
+         id: session.userId,

📌 IDE AST Context: Modified symbols likely include [createOmniAccount, getOmniAccount, getOmniTasks, createOmniTask, updateOmniTaskStatus]
- **[what-changed] what-changed in feedback.ts**: File updated (external): src/app/actions/feedback.ts

Content summary (29 lines):
"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function submitFeedbackAction(message: string) {
  const tenantId = await requireActiveTenant();
  const supabase = await getSupabaseServer();
  
  // Log to a simple 'feedback' table if exists, or just log to console/audit for MVP
  // Ideally we'd have a feedback table. For now, let's insert into 'audit_logs' or similar if generic,
  // OR just assume
- **[problem-fix] problem-fix in admin.ts**: File updated (external): src/app/actions/admin.ts

Content summary (87 lines):
"use server";

import { ControlService, SystemFlagKey } from "@/lib/services/controlService";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleSystemFlagAction(key: SystemFlagKey, value: boolean) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await ControlService.toggleSystemFlag(key, v
- **[what-changed] what-changed in admin-data.ts**: -         userService.getUserAuditLogs(id)
+         userService.getAuditLogs(id)

📌 IDE AST Context: Modified symbols likely include [getAdminDashboardStats, getOmniAdminData, getUsersPageData, getUserDetailPageData]
- **[what-changed] Updated raw database schema — parallelizes async operations for speed**: - "use server";
+ 
- 
+ "use server";
- import { getSupabaseServer } from "@/lib/supabase/server";
+ 
- import { omniService } from "@/lib/services/omniService";
+ import { getSupabaseServer } from "@/lib/supabase/server";
- import { omniMemoryService } from "@/lib/services/omniMemoryService";
+ import { omniService } from "@/lib/services/omniService";
- 
+ import { userService } from "@/lib/services/userService";
- // Dashboard Overview
+ 
- export async function getAdminDashboardStats() {
+ // Dashboard Overview
-     const supabase = await getSupabaseServer();
+ export async function getAdminDashboardStats() {
-     const [
+     const supabase = await getSupabaseServer();
-         { count: userCount },
+     
-         { data: recentLogs }
+     // Quick totals from raw tables for speed
-       ] = await Promise.all([
+     const [stats, usersCount] = await Promise.all([
-         supabase.from("users").select("*", { count: "exact", head: true }),
+         omniService.getStats(),
-         supabase.from("admin_audit_logs").select("*").order("timestamp", { ascending: false }).limit(5)
+         supabase.from("profiles").select("*", { count: "exact", head: true })
-       ]);
+     ]);
-     
+ 
-       return { userCount, recentLogs };
+     return {
- }
+         stats,
- 
+         totalProfiles: usersCount.count || 0
- // Omni Page
+     };
- export async function getOmniPageData() {
+ }
-     const [config, stats, allUsers, logs] = await Promise.all([
+ 
-         omniService.getConfig(),
+ // Omni Core Admin Data
-         omniService.getStats(),
+ export async function getOmniAdminData() {
-         omniMemoryService.getUsers(),
+     const [config, stats, allUsers, logs] = await Promise.all([
-         omniService.getAuditLogs()
+         omniService.getConfig(),
-     ]);
+         omniService.getStats(),
-     
+         userService.getUsers(),
-     const omniUsers = allUsers.filter(u => u.roles.isOmniUser);
+         omniService.getAuditLogs()
-     
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [getAdminDashboardStats, getOmniAdminData, getUsersPageData, getUserDetailPageData]
- **[what-changed] what-changed in omni-learning.ts**: File updated (external): src/app/actions/omni-learning.ts

Content summary (101 lines):

"use server";

import { omniMemoryService } from "@/lib/services/omniMemoryService";
import { userService } from "@/lib/services/userService";
import { getSession } from "@/lib/auth/session";
import { OmniMemory } from "@/types/omni-learning";
import { revalidatePath } from "next/cache";

// Helper to ensure user is authenticated
async function getAuthenticatedUserId() {
  const session = await getSession();
  const userId = session?.userId || "USR-001"; // Dev fallback
  
  const user = await 
- **[what-changed] what-changed in next.config.ts**: -   experimental: {
+   logging: {
-     logging: {
+     fetches: {
-       fetches: {
+       fullUrl: true
-         fullUrl: true
+     }
-       }
+   },
-     },
+   experimental: {

📌 IDE AST Context: Modified symbols likely include [nextConfig, default]
- **[convention] what-changed in user.ts — confirmed 6x**: -     const { data, historyData } = await supabase
+     const { data: historyData } = await supabase

📌 IDE AST Context: Modified symbols likely include [omniUserService]
- **[problem-fix] Patched security issue Comprehensive — improves module reusability**: -     serverActions: {
+     logging: {
-       bodySizeLimit: '2mb',
+       fetches: {
-     },
+         fullUrl: true
-     // Comprehensive tree-shaking and import optimization
+       }
-     optimizePackageImports: [
+     },
-       'lucide-react', 
+     serverActions: {
-       'date-fns', 
+       bodySizeLimit: '2mb',
-       'framer-motion',
+     },
-       '@radix-ui/react-avatar',
+     // Comprehensive tree-shaking and import optimization
-       '@radix-ui/react-tabs',
+     optimizePackageImports: [
-       '@radix-ui/react-dialog',
+       'lucide-react', 
-       '@radix-ui/react-dropdown-menu',
+       'date-fns', 
-       '@radix-ui/react-select',
+       'framer-motion',
-       'clsx',
+       '@radix-ui/react-avatar',
-       'tailwind-merge'
+       '@radix-ui/react-tabs',
-     ],
+       '@radix-ui/react-dialog',
-   },
+       '@radix-ui/react-dropdown-menu',
-   serverExternalPackages: ['jspdf', 'fflate'],
+       '@radix-ui/react-select',
-   env: {
+       'clsx',
-     NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
+       'tailwind-merge'
-     NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
+     ],
-   async headers() {
+   serverExternalPackages: ['jspdf', 'fflate'],
-     return [
+   env: {
-       {
+     NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
-         source: '/(.*)',
+     NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
-         headers: [
+   },
-           { key: 'X-DNS-Prefetch-Control', value: 'on' },
+   async headers() {
-           { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
+     return [
-           { key: 'X-XSS-Protection', value: '1; mode=block' },
+       {
-           { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
+         source: '/(.*)',
-    
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [nextConfig, default]
- **[problem-fix] problem-fix in admin.test.ts**: File updated (external): src/lib/services/omni/admin.test.ts

Content summary (84 lines):
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { omniAdminService } from './admin';
import { userService } from '@/lib/services/userService';
import { User } from '@/types/user';

// Mock dependencies
vi.mock('@/lib/services/userService', () => ({
    userService: {
        getUsers: vi.fn(),
    },
}));

vi.mock('@/lib/supabase/server', () => ({
    getSupabaseServer: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    log: { error: vi.fn() },
}));

describe('omniAdminSer
- **[what-changed] Replaced dependency config**: - import { kaisaConfigService } from "./omni/config";
+ import { omniConfigService } from "./omni/config";
- import { kaisaAdminService } from "./omni/admin";
+ import { omniAdminService } from "./omni/admin";
- import { kaisaUserService } from "./omni/user";
+ import { omniUserService } from "./omni/user";
-   ...kaisaConfigService,
+   ...omniConfigService,
-   ...kaisaAdminService,
+   ...omniAdminService,
-   ...kaisaUserService,
+   ...omniUserService,

📌 IDE AST Context: Modified symbols likely include [omniService]
