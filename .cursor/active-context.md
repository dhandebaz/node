> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\components\layout\UniversalNavbar.tsx` (Domain: **Frontend (React/UI)**)

### 📐 Frontend (React/UI) Conventions & Fixes
- **[convention] Strengthened types page**: -                   {(recentActivity || []).map((activity: any) => {
+                   {(recentActivity as any[] || []).map((activity: any) => {

📌 IDE AST Context: Modified symbols likely include [dynamic, AIDashboardPage]
- **[convention] Fixed null crash in System — prevents null/undefined runtime crashes — confirmed 3x**: -                       {f.tenants?.name} • {f.category} • {f.source}
+                       {f.tenants?.name || "System"} • {f.category} • {f.source}
-                       {new Date(f.created_at).toLocaleString()}
+                       {f.created_at ? new Date(f.created_at).toLocaleString() : "Recently"}

📌 IDE AST Context: Modified symbols likely include [AdminFailureRecord, AdminFailuresPage]
- **[what-changed] what-changed in page.tsx**: File updated (external): src/app/(admin)/admin/(dashboard)/pricing/page.tsx

Content summary (78 lines):
import { getSupabaseServer } from "@/lib/supabase/server";
import { PricingEditor } from "@/components/admin/pricing/PricingEditor";
import { PlansEditor } from "@/components/admin/pricing/PlansEditor";
import { BillingPlan } from "@/types";
import { DollarSign, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await getSupabaseServer();
  
  // 1. Get Cost Config
  const { data: configData } = await supabas
- **[what-changed] what-changed in page.tsx**: File updated (external): src/app/(customer)/dashboard/ai/page.tsx

Content summary (390 lines):
import { getActiveTenantId, getTenantContext } from "@/lib/auth/tenant";
import { DBAuditEvent } from "@/types/database";
import { WalletService } from "@/lib/services/walletService";
import { ControlService } from "@/lib/services/controlService";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  CreditCard,
  MessageSquare,
  Home,
  Calendar,
  Activity,
  Plus,
  AlertTriangle,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { r
- **[convention] what-changed in page.tsx — confirmed 3x**: File updated (external): src/app/(customer)/dashboard/billing/history/page.tsx

Content summary (95 lines):
export const dynamic = 'force-dynamic';


import { getBillingHistory } from "@/app/actions/billing";
import { Download, Search, Filter } from "lucide-react";
import Link from "next/link";

export default async function BillingHistoryPage() {
  const invoices = await getBillingHistory();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        
- **[convention] Strengthened types UNKNOWN — prevents null/undefined runtime crashes**: -               {subscription.status.toUpperCase()}
+               {(subscription.status || 'UNKNOWN').toUpperCase()}
-               <span className="text-zinc-300">{new Date(subscription.currentPeriodStart).toLocaleDateString()}</span>
+               <span className="text-zinc-300">
-             </div>
+                 {subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart).toLocaleDateString() : 'N/A'}
-             <div>
+               </span>
-               <span className="block text-muted-foreground mb-1">Renews On</span>
+             </div>
-               <span className="text-zinc-300">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
+             <div>
-             </div>
+               <span className="block text-muted-foreground mb-1">Renews On</span>
-           </div>
+               <span className="text-zinc-300">
-         </div>
+                 {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
- 
+               </span>
-         {/* Actions */}
+             </div>
-         <div className="p-6 bg-muted text-foreground/30 space-y-4">
+           </div>
-           
+         </div>
-           {subscription.cancelAtPeriodEnd ? (
+ 
-              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
+         {/* Actions */}
-               <h3 className="text-yellow-400 font-medium mb-1">Cancellation Scheduled</h3>
+         <div className="p-6 bg-muted text-foreground/30 space-y-4">
-               <p className="text-sm text-yellow-300/80 mb-3">
+           
-                 Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Access will continue until then.
+           {subscription.cancelAtPeriodEnd ? (
-               </p>
+              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
-               <form action={async () => {
+   
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [dynamic, SubscriptionDetailsPage]
- **[discovery] discovery in page.tsx**: File updated (external): src/app/(customer)/dashboard/billing/subscription/[id]/page.tsx

Content summary (154 lines):
export const dynamic = 'force-dynamic';


import { 
  getBillingOverview, 
  cancelSubscriptionAction, 
  resumeSubscriptionAction 
} from "@/app/actions/billing";
import { billingService } from "@/lib/services/billingService";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { SubscriptionStatus } from "@/types/billing";

// Client component for actions would be 
- **[what-changed] what-changed in WalletUI.tsx**: File updated (external): src/app/(customer)/dashboard/billing/WalletUI.tsx

Content summary (515 lines):
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  History,
  X,
  Loader2,
} from "lucide-react";
import Script from "next/script";
import { fetchWithAuth } from "@/lib/api/fetcher";

export interface WalletTransaction {
  id: string;
  amount: number | null;
  type: string | null;
  description: string | null;
  created_at: string | null;
}

interface WalletUIProps {
  initialBalance: nu
- **[discovery] discovery in BookingActivityTimeline.tsx**: File updated (external): src/components/bookings/BookingActivityTimeline.tsx

Content summary (197 lines):
"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { format, parseISO } from "date-fns";
import { 
  Loader2, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Bot, 
  User, 
  Shield, 
  Plug,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";

type AuditEvent = {
  id: string;
  actor_
- **[discovery] discovery in PlansEditor.tsx**: File updated (external): src/components/admin/pricing/PlansEditor.tsx

Content summary (206 lines):
"use client";

import { useState } from "react";
import { BillingPlan } from "@/types/billing";
import { updatePlanAction, createPlanAction } from "@/app/actions/admin";
import { Edit2, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PlansEditor({ plans: initialPlans }: { plans: BillingPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);

- **[what-changed] Replaced auth BillingPlan — prevents null/undefined runtime crashes**: - import { DollarSign, Tag } from "lucide-react";
+ import { BillingPlan } from "@/types/billing";
- 
+ import { DollarSign, Tag } from "lucide-react";
- export const dynamic = "force-dynamic";
+ 
- 
+ export const dynamic = "force-dynamic";
- export default async function AdminPricingPage() {
+ 
-   const supabase = await getSupabaseServer();
+ export default async function AdminPricingPage() {
-   
+   const supabase = await getSupabaseServer();
-   // 1. Get Cost Config
+   
-   const { data: configData } = await supabase
+   // 1. Get Cost Config
-     .from('system_settings')
+   const { data: configData } = await supabase
-     .select('value')
+     .from('system_settings')
-     .eq('key', 'pricing_config')
+     .select('value')
-     .single();
+     .eq('key', 'pricing_config')
- 
+     .single();
-   const config = configData?.value || { 
+ 
-     per_1k_tokens: 5, 
+   const config = configData?.value || { 
-     multipliers: { ai_reply: 1.0, calendar_sync: 0.5, availability_check: 2.0 } 
+     per_1k_tokens: 5, 
-   };
+     multipliers: { ai_reply: 1.0, calendar_sync: 0.5, availability_check: 2.0 } 
- 
+   };
-   // 2. Get Plans
+ 
-   const { data: plans } = await supabase
+   // 2. Get Plans
-     .from('billing_plans')
+   const { data: plans } = await supabase
-     .select('*')
+     .from('billing_plans')
-     .order('price', { ascending: true }) as { data: BillingPlan[] | null };
+     .select('*')
- 
+     .order('price', { ascending: true }) as { data: BillingPlan[] | null };
-   return (
+ 
-     <div className="space-y-12 pb-20">
+   return (
-       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
+     <div className="space-y-12 pb-20">
-         <div className="space-y-4">
+       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10 mb-10">
-           <div className="flex items-center gap-3">
+         <div className="s
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [dynamic, AdminPricingPage]
