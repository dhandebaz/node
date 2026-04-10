> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\components\admin\omni\KaisaAuditLog.tsx` (Domain: **Frontend (React/UI)**)

### 📐 Frontend (React/UI) Conventions & Fixes
- **[decision] decision in KaisaOverview.tsx**: File updated (external): src/components/admin/omni/KaisaOverview.tsx

Content summary (66 lines):

"use client";

import { KaisaStats } from "@/types/omni";
import { Users, UserCheck, UserMinus, Briefcase, Crown } from "lucide-react";

export function KaisaOverview({ stats }: { stats: KaisaStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-silver/10 rounded text-brand-s
- **[what-changed] Replaced dependency KaisaCreditUsage**: - import { KaisaCreditUsage } from "@/types/kaisa";
+ import { KaisaCreditUsage } from "@/types/omni";

📌 IDE AST Context: Modified symbols likely include [dynamic, CustomerLayout]
- **[what-changed] Replaced dependency omniService**: - import { kaisaService } from "@/lib/services/kaisaService";
+ import { omniService } from "@/lib/services/omniService";
-         kaisaCredits = await kaisaService.getCreditUsage(
+         kaisaCredits = await omniService.getCreditUsage(

📌 IDE AST Context: Modified symbols likely include [dynamic, CustomerLayout]
- **[decision] decision in page.tsx**: File updated (external): src/app/(admin)/admin/(dashboard)/omni/page.tsx

Content summary (73 lines):
"use client";

export const dynamic = 'force-dynamic';


import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getOmniPageData } from "@/app/actions/admin-data";
import { OmniOverview } from "@/components/admin/omni/KaisaOverview";
import { CapabilitiesControl } from "@/components/admin/omni/CapabilitiesControl";
import { RoleGovernance } from "@/components/admin/omni/Role
- **[what-changed] Updated the database schema — prevents null/undefined runtime crashes**: -                   </div>
+                 ) : (
-                 ) : (
+                   filteredConversations.map((conv) => (
-                 ) : (
+                     <ConversationListItem
-                   filteredConversations.map((conv) => (
+                       key={conv.id}
-                     <ConversationListItem
+                       conversation={conv}
-                       key={conv.id}
+                       isSelected={conv.id === selectedConversationId}
-                       conversation={conv}
+                       onSelect={(id) => setSelectedConversationId(id)}
-                       isSelected={conv.id === selectedConversationId}
+                       icon={channelIcon[conv.channel]}
-                       onSelect={(id) => setSelectedConversationId(id)}
+                     />
-                       icon={channelIcon[conv.channel]}
+                   ))
-                     />
+                 )}
-                   ))
+               </div>
-                 )}
+             </div>
-               </div>
+ 
-             </div>
+             {/* Thread View */}
- 
+             <div className="flex-1 flex flex-col relative bg-zinc-50/30">
-             {/* Thread View */}
+               {!selectedConversation ? (
-             <div className="flex-1 flex flex-col relative bg-zinc-50/30">
+                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
-               {!selectedConversation ? (
+                   <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50">
-                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
+                     <MessageSquare className="w-10 h-10 text-zinc-200" />
-                   <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-xl shad
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [ConversationMessage, ContextField, QuickAction, ConversationContext, SystemMeta]
- **[what-changed] what-changed in DashboardSidebar.tsx**: -         "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
+         "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-xl transition-all duration-200 group relative",

📌 IDE AST Context: Modified symbols likely include [SidebarItemProps, SidebarItem, DashboardSidebar]
- **[what-changed] what-changed in layout.tsx**: -           {/* Main Orbs - Very subtle for light mode */}
+           {/* Main Orbs - Very subtle for light mode, simplified for mobile */}
-           <div className="absolute top-[-20%] left-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-1 blur-[120px] opacity-40 animate-pulse-slow" />
+           <div className="absolute top-[-20%] left-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-1 blur-[120px] opacity-40 animate-pulse-slow md:opacity-40 opacity-20" />
-           <div className="absolute bottom-[-20%] right-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-2 blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }} />
+           <div className="absolute bottom-[-20%] right-[-10%] h-[100vh] w-[100vw] rounded-full mesh-bg-orb-2 blur-[120px] opacity-30 animate-pulse-slow hidden md:block" style={{ animationDelay: '2s' }} />
-           {/* Subtle accent orbs */}
+           {/* Subtle accent orbs - Desktop Only */}
-           <div className="absolute top-[40%] right-[10%] h-[40vh] w-[40vw] rounded-full bg-blue-400/5 blur-[100px]" />
+           <div className="absolute top-[40%] right-[10%] h-[40vh] w-[40vw] rounded-full bg-blue-400/5 blur-[100px] hidden lg:block" />
-           <div className="absolute bottom-[20%] left-[20%] h-[30vh] w-[30vh] rounded-full bg-purple-400/5 blur-[80px]" />
+           <div className="absolute bottom-[20%] left-[20%] h-[30vh] w-[30vh] rounded-full bg-purple-400/5 blur-[80px] hidden lg:block" />
-           <div className="absolute inset-0 bg-grid-white opacity-[1]" />
+           <div className="absolute inset-0 bg-grid-white opacity-[0.5] md:opacity-[1]" />

📌 IDE AST Context: Modified symbols likely include [montserrat, metadata, RootLayout]
- **[convention] what-changed in page.tsx — confirmed 3x**: File updated (external): src/app/(customer)/dashboard/ai/marketing/page.tsx

Content summary (142 lines):
import { requireActiveTenant } from "@/lib/auth/tenant";
import { getSupabaseServer } from "@/lib/supabase/server";
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MarketingDashboardPage() {
  
- **[what-changed] Added OAuth2 authentication — prevents null/undefined runtime crashes**: - export default function ListingIntegrationsPage() {
+ export default function ServiceIntegrationsPage() {
-       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
+       <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
-         <div className="space-y-2">
+         <div className="space-y-1">
-             <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.2em] uppercase">
+             <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">
-                 <Sparkles className="w-3 h-3" />
+               Connectivity Hub
-                 Connectivity
+             </h1>
-             </div>
+             <p className="text-zinc-500 font-medium italic">Link your channels to activate Omni AI across your entire operation.</p>
-             <h1 className="text-4xl font-bold text-white tracking-tight">Integrations</h1>
+         </div>
-             <p className="text-zinc-400 text-sm max-w-md line-clamp-2">Link your channels to activate the full power of Nodebase AI and the Sales Pipeline.</p>
+         <div className="flex flex-col items-end gap-2 min-w-[240px]">
-         </div>
+             <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
-         <div className="flex flex-col items-end gap-2 min-w-[240px]">
+                 <span>Infrastructure Readiness</span>
-             <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">
+                 <span className="text-blue-600">{progress}%</span>
-                 <span>Setup Progress</span>
+             </div>
-                 <span className="text-primary">{progress}%</span>
+             <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
-             </div>
+     
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [GoogleIntegrationStatus, GenericIntegrationStatus, ServiceIntegrationsPage]
- **[what-changed] what-changed in KaisaStatusControl.tsx**: File updated (external): src/components/admin/user/KaisaStatusControl.tsx

Content summary (51 lines):
"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { toggleUserKaisaStatusAction } from "@/app/actions/omni-core";
import { Power } from "lucide-react";

export function KaisaStatusControl({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const status = user.products.kaisa?.status || "active";

  const handleToggle = async () => {
    if (!user.products.kaisa) return;
    
    const newStatus = status === "active" ? "paus
- **[what-changed] what-changed in FeedbackForm.tsx**: File updated (external): src/components/omni/learning/FeedbackForm.tsx

Content summary (109 lines):

"use client";

import { useState } from "react";
import { addExplicitFeedbackAction } from "@/app/actions/omni-learning";
import { Loader2, Plus, MessageSquare, AlertCircle } from "lucide-react";

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addExplicitFeedbackAction(formData);
      setIsOpen(false);
    } catch (er
- **[convention] Fixed null crash in Executive — prevents null/undefined runtime crashes — confirmed 3x**: -           <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
+           <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter mb-1">
-             Overview
+             Executive Overview
-           <p className="text-muted-foreground">
+           <p className="text-zinc-500 font-medium italic">
-             Welcome back, {tenant?.name}. Here&apos;s what&apos;s happening.
+             Institutional control center for {tenant?.name}.
-           <Button asChild className="font-bold">
+           <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all h-12 px-6">
-         <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
+         <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/20 transition-all border-b-4 border-b-blue-600/10">
-               <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
+               <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
-                 Top Up <ArrowRight className="w-3 h-3" />
+                 Refill <ArrowRight className="w-3 h-3" />
-                 Wallet Balance
+                 Operational Capital
-         <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all">
+         <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-200/20 transition-all border-b-4 border-b-blue-600">
-               <div className="p-2 bg-blue-600 rounded-xl text-white">
+               <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
-                 AI Automations
+                 Omni AI Automations

📌 IDE AST Context: Modified symbols likely include [AIDashboardPage]
- **[convention] discovery in page.tsx — confirmed 3x**: File updated (external): src/app/(customer)/dashboard/ai/settings/page.tsx

Content summary (315 lines):
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  getBusinessLabels,
  getPersonaAIDefaults,
} from "@/lib/business-context";
import { Loader2, Brain, MessageSquare, Shield, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } 
- **[convention] Updated the database schema — prevents null/undefined runtime crashes — confirmed 3x**: -                 )}
+               </div>
-               </div>
+             </div>
-             </div>
+ 
- 
+             {/* Thread View */}
-             {/* Thread View */}
+             <div className="flex-1 flex flex-col relative bg-zinc-50/30">
-             <div className="flex-1 flex flex-col relative bg-zinc-50/30">
+               {!selectedConversation ? (
-               {!selectedConversation ? (
+                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
-                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
+                   <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50">
-                   <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50">
+                     <MessageSquare className="w-10 h-10 text-zinc-200" />
-                     <MessageSquare className="w-10 h-10 text-zinc-200" />
+                   </div>
-                   </div>
+                   <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">No chat selected</h2>
-                   <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">No chat selected</h2>
+                   <p className="text-sm text-zinc-500 mt-2 font-medium max-w-xs">Select a conversation from the left to start communicating with your lead.</p>
-                   <p className="text-sm text-zinc-500 mt-2 font-medium max-w-xs">Select a conversation from the left to start communicating with your lead.</p>
+                 </div>
-                 </div>
+               ) : (
-               ) : (
+                 <>
-                             <ChatThread
+                   <ChatThread
-                   conversation={selectedConversation}
+                     conversation
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [ConversationMessage, ContextField, QuickAction, ConversationContext, SystemMeta]
- **[what-changed] Updated schema ChatThread — prevents null/undefined runtime crashes**: -                 <>
+                             <ChatThread
-                   {/* Thread Header */}
+                   conversation={selectedConversation}
-                   <div className="h-20 flex-shrink-0 border-b border-zinc-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
+                   messages={messages}
-                     <div className="flex items-center gap-4">
+                   loading={loadingThread}
-                       <button onClick={() => setSelectedConversationId(null)} className="md:hidden p-2 text-zinc-400 hover:text-zinc-950 transition-colors">
+                   aiPaused={selectedConversation.aiPaused || false}
-                         <ChevronLeft className="w-6 h-6" />
+                   onToggleAi={handleAIPauseToggle}
-                       </button>
+                   onToggleSidebar={() => setShowContext(!showContext)}
-                       <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-950 text-sm border border-zinc-200">
+                   showSidebar={showContext}
-                         {selectedConversation.customerName?.charAt(0) || "C"}
+                 />
-                       </div>
+ 
-                       <div>
+                 {/* Reply Area */}
-                         <div className="flex items-center gap-2">
+                 <div className="p-6 bg-white border-t border-zinc-100">
-                           <h2 className="font-black text-zinc-950 uppercase tracking-tight">
+                   <div className="max-w-4xl mx-auto space-y-4">
-                             {selectedConversation.customerName || selectedConversation.customerPhone}
+                     {suggestions.length > 0 && (
-                           </h2>
+                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
-                           <Badge variant="outline" className="text-[9px] h-4 
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [ConversationMessage, ContextField, QuickAction, ConversationContext, SystemMeta]
