> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\components\admin\settings\SettingsAuditLog.tsx` (Domain: **Frontend (React/UI)**)

### 📐 Frontend (React/UI) Conventions & Fixes
- **[convention] Fixed null crash in Memoize — avoids unnecessary re-renders in React — confirmed 3x**: -   const supabase = getSupabaseBrowser();
+   // Memoize to avoid recreating the client on every render
- 
+   const supabase = useMemo(() => getSupabaseBrowser(), []);
-   const logout = useCallback(async () => {
+ 
-     await supabase.auth.signOut();
+   const logout = useCallback(async () => {
-     setUser(null);
+     await supabase.auth.signOut();
-     setRole(null);
+     setUser(null);
-     // Clear the tenant cookie via server route
+     setRole(null);
-     try {
+     // Clear the tenant cookie via server route
-       const csrf = getCsrfToken();
+     try {
-       await fetch("/api/auth/tenant-cookie/clear", {
+       const csrf = getCsrfToken();
-         method: "POST",
+       await fetch("/api/auth/tenant-cookie/clear", {
-         headers: csrf ? { "x-csrf-token": csrf } : undefined,
+         method: "POST",
-       });
+         headers: csrf ? { "x-csrf-token": csrf } : undefined,
-     } catch {}
+       });
-     
+     } catch {}
-     setSessionStatus("unauthenticated");
+     
-     router.push("/login");
+     setSessionStatus("unauthenticated");
-   }, [supabase, router]);
+     router.push("/login");
- 
+   }, [supabase, router]);
-   const refreshSession = useCallback(async () => {
+ 
-     try {
+   const refreshSession = useCallback(async () => {
-       const { data, error } = await supabase.auth.refreshSession();
+     try {
-       if (error || !data.session) {
+       const { data, error } = await supabase.auth.refreshSession();
-         setSessionStatus("expired");
+       if (error || !data.session) {
-       } else {
+         setSessionStatus("expired");
-         const user = data.session.user;
+       } else {
-         setUser(user);
+         const user = data.session.user;
-         setRole((user.user_metadata?.role as UserRole) || "customer");
+         setUser(user);
-         setSessionStatus("authenticated");
+         setRole((user.user_metadata?.role as UserRole) || "customer");
-       }
+         setSession
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [UserRole, SessionStatus, AuthContextType, AuthContext, AuthProvider]
- **[convention] Strengthened types Nodebase — improves module reusability**: -   },
+     images: [
-   twitter: {
+       {
-     card: "summary_large_image",
+         url: "/og-image.png",
-     title: "Nodebase | The AI Assistant for Local Businesses",
+         width: 1200,
-     description:
+         height: 630,
-       "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
+         alt: "Nodebase — The AI Assistant for Local Businesses",
-     images: ["/og-image.png"],
+       },
-   },
+     ],
-   openGraph: {
+   },
-     title: "Nodebase | The AI Assistant for Local Businesses",
+   twitter: {
-     description:
+     card: "summary_large_image",
-       "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
+     title: "Nodebase | The AI Assistant for Local Businesses",
-     url: getAppUrl(),
+     description:
-     siteName: "Nodebase",
+       "Nodebase connects to your WhatsApp and website to instantly answer customer questions, schedule bookings, and collect payments automatically - 24/7.",
-     type: "website",
+     images: ["/og-image.png"],
-     images: [
+   },
-       {
+ };
-         url: "/og-image.png",
+ 
-         width: 1200,
+ export default async function RootLayout({
-         height: 630,
+   children,
-         alt: "Nodebase — The AI Assistant for Local Businesses",
+ }: Readonly<{
-       },
+   children: React.ReactNode;
-     ],
+ }>) {
-   },
+   return (
- };
+     <html lang="en" className="dark scroll-smooth">
- 
+       <body
- export default async function RootLayout({
+         className={`${montserrat.variable} min-h-screen bg-black text-foreground font-sans antialiased selection:bg-blue-500/30 selection:text-white`}
-   children,
+       >
- }: Readonly<{
+         {/* Immersive Background Engine */}
-   children: React.ReactNode;
+         <div className="noise-overlay" />
- }>) {
+         <div 
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [montserrat, metadata, RootLayout]
- **[what-changed] what-changed in layout.tsx**: File updated (external): src/app/layout.tsx

Content summary (89 lines):
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getAppUrl } from "@/lib/runtime-config";
// export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "
- **[decision] decision in AuthContext.tsx**: File updated (external): src/contexts/AuthContext.tsx

Content summary (142 lines):
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredOverlay } from "@/components/auth/SessionExpiredOverlay";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getCsrfToken } from "@/lib/api/csrf";

type UserRole = "customer" | "business" | "admin" | "superadmin";
type SessionSt
- **[decision] Optimized Auto — reduces excessive function call frequency**: -       // Only auto-collapse/expand when crossing the 1024px threshold
+       // Auto-collapse logic based on width
-       // to avoid triggering it on minor height-only resizes or small width changes.
+       if (width >= 768 && width < 1024) {
-       if (width < 1024) {
+         setIsCollapsed(true);
-         setIsCollapsed(true);
+       } else if (width >= 1024) {
-       } else {
+         setIsCollapsed(false);
-         setIsCollapsed(false);
+       }
-       }
+     };
-     };
+ 
- 
+     // Use a small delay/timeout if resize feels too aggressive
-     checkViewport();
+     let timeoutId: NodeJS.Timeout;
-     
+     const debouncedCheck = () => {
-     // Use an optimized resize listener (could use debounce but standard resize is fine for this)
+       clearTimeout(timeoutId);
-     window.addEventListener("resize", checkViewport);
+       timeoutId = setTimeout(checkViewport, 100);
-     return () => window.removeEventListener("resize", checkViewport);
+     };
-   }, []);
+ 
- 
+     checkViewport();
-   const menuItems = [
+     window.addEventListener("resize", debouncedCheck);
-     { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
+     return () => {
-     { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
+       window.removeEventListener("resize", debouncedCheck);
-     { label: "Bookings", icon: Calendar, href: "/dashboard/ai/bookings" },
+       clearTimeout(timeoutId);
-     { label: "Calendar", icon: CalendarDays, href: "/dashboard/ai/calendar" },
+     };
-     { label: "Listings", icon: Briefcase, href: "/dashboard/ai/listings" },
+   }, []);
-     { label: "Insights", icon: BarChart3, href: "/dashboard/ai/insights" },
+ 
-     { label: "Integrations", icon: Puzzle, href: "/dashboard/ai/integrations" },
+   const menuItems = [
-   ];
+     { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
- 
+     { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
-   const
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [SidebarItemProps, SidebarItem, DashboardSidebar]
- **[convention] Fixed null crash in Timezone — confirmed 3x**: -                   className="input-glass bg-zinc-900 text-white cursor-pointer"
+                   className="input-glass bg-[#0a0a0a] border-white/10 text-white cursor-pointer appearance-none"
-                 >
+                   style={{
-                   {listingTypes.map((option) => (
+                     backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
-                     <option key={option} value={option} className="bg-zinc-900 text-white">
+                     backgroundRepeat: 'no-repeat',
-                       {option}
+                     backgroundPosition: 'right 1rem center',
-                     </option>
+                     backgroundSize: '1em',
-                   ))}
+                   }}
-                 </select>
+                 >
-               </div>
+                   {listingTypes.map((option) => (
-               <div className="space-y-2">
+                     <option key={option} value={option} className="bg-zinc-950 text-white">
-                 <label
+                       {option}
-                   htmlFor="listing-timezone"
+                     </option>
-                   className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
+                   ))}
-                 >
+                 </select>
-                   Timezone
+               </div>
-                 </label>
+               <div className="space-y-2">
-                 <input
+                 <label
-                   id="listing-timezone"
+                   htmlFor="listing-timezone"
-                   name="listingTimezone"
+                   className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
-                   value={timezone}
+                 >
-                   on
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[decision] decision in DashboardSidebar.tsx**: -           ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(66,133,244,0.15)]"
+           ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_12px_rgba(66,133,244,0.1)]"
-           : "text-muted-foreground hover:text-foreground hover:bg-white/5",
+           : "text-zinc-400 hover:text-white hover:bg-white/5",
-           active ? "text-primary flex-shrink-0" : "text-muted-foreground group-hover:text-foreground",
+           active ? "text-primary flex-shrink-0" : "text-zinc-500 group-hover:text-white",
-         {menuItems.map((item) => (
+         {menuItems.map((item) => {
-           <SidebarItem
+           const isActive = item.href === "/dashboard/ai" 
-             key={item.href}
+             ? pathname === item.href 
-             {...item}
+             : pathname.startsWith(item.href);
-             active={pathname === item.href}
+             
-             collapsed={isCollapsed}
+           return (
-           />
+             <SidebarItem
-         ))}
+               key={item.href}
-       </div>
+               {...item}
- 
+               active={isActive}
-       {/* Bottom Section */}
+               collapsed={isCollapsed}
-       <div className="px-4 space-y-2">
+             />
-         <div className="h-px bg-white/5 my-4 mx-2" />
+           );
-         {bottomItems.map((item) => (
+         })}
-           <SidebarItem
+       </div>
-             key={item.href}
+ 
-             {...item}
+       {/* Bottom Section */}
-             active={pathname === item.href}
+       <div className="px-4 space-y-2">
-             collapsed={isCollapsed}
+         <div className="h-px bg-white/5 my-4 mx-2" />
-           />
+         {bottomItems.map((item) => (
-         ))}
+           <SidebarItem
-       </div>
+             key={item.href}
-     </motion.aside>
+             {...item}
-   );
+             active={pathname === item.href}
- }
+             collapsed={isCollapsed}
- 
+           
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [SidebarItemProps, SidebarItem, DashboardSidebar]
- **[convention] Fixed null crash in Math — confirmed 4x**: -     if (step === 1 && !capabilities.calendar) {
+     setStep((prev) => Math.min(prev + 1, 2));
-       setStep(4);
+   };
-       return;
+ 
-     }
+   const prevStep = () => {
-     setStep((prev) => Math.min(prev + 1, 4));
+     if (step === 1) {
-   };
+       router.push("/dashboard/ai/listings");
- 
+       return;
-   const prevStep = () => {
+     }
-     if (step === 1) {
+     setStep((prev) => prev - 1);
-       router.push("/dashboard/ai/listings");
+   };
-       return;
+ 
-     }
+   const handleSave = async () => {
-     if (step === 4 && !capabilities.calendar) {
+     if (!name.trim() || !city.trim()) {
-       setStep(1);
+       setMessage("Property name and city are required.");
-     setStep((prev) => prev - 1);
+     const integrations: ListingIntegration[] = platforms.map((platform) => ({
-   };
+       listingId,
- 
+       platform,
-   const handleSave = async () => {
+       externalIcalUrl: externalIcalUrls[platform] || null,
-     if (!name.trim() || !city.trim()) {
+       lastSyncedAt: null,
-       setMessage("Property name and city are required.");
+       status: externalIcalUrls[platform] ? "connected" : "not_connected",
-       return;
+     }));
-     }
+     try {
-     const integrations: ListingIntegration[] = platforms.map((platform) => ({
+       setSaving(true);
-       listingId,
+       setMessage(null);
-       platform,
+       const payload = {
-       externalIcalUrl: externalIcalUrls[platform] || null,
+         listing: {
-       lastSyncedAt: null,
+           id: listingId,
-       status: externalIcalUrls[platform] ? "connected" : "not_connected",
+           userId: "current",
-     }));
+           name: name.trim(),
-     try {
+           city: city.trim(),
-       setSaving(true);
+           address: address.trim() || null,
-       setMessage(null);
+           type,
-       const payload = {
+           timezone,
-         listing: {
+           status: integrations.length > 0 ? "active" : "incomplete"
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[convention] what-changed in page.tsx — confirmed 3x**: -                   className="input-glass"
+                   className="input-glass bg-zinc-900 text-white cursor-pointer"

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[decision] Optimized Only — reduces excessive function call frequency**: -     const checkMobile = () => {
+     const checkViewport = () => {
-       setIsMobile(window.innerWidth < 768);
+       const width = window.innerWidth;
-       if (window.innerWidth < 1024) setIsCollapsed(true);
+       setIsMobile(width < 768);
-       else setIsCollapsed(false);
+       
-     };
+       // Only auto-collapse/expand when crossing the 1024px threshold
-     checkMobile();
+       // to avoid triggering it on minor height-only resizes or small width changes.
-     window.addEventListener("resize", checkMobile);
+       if (width < 1024) {
-     return () => window.removeEventListener("resize", checkMobile);
+         setIsCollapsed(true);
-   }, []);
+       } else {
- 
+         setIsCollapsed(false);
-   const menuItems = [
+       }
-     { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
+     };
-     { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
+ 
-     { label: "Bookings", icon: Calendar, href: "/dashboard/ai/bookings" },
+     checkViewport();
-     { label: "Calendar", icon: CalendarDays, href: "/dashboard/ai/calendar" },
+     
-     { label: "Listings", icon: Briefcase, href: "/dashboard/ai/listings" },
+     // Use an optimized resize listener (could use debounce but standard resize is fine for this)
-     { label: "Insights", icon: BarChart3, href: "/dashboard/ai/insights" },
+     window.addEventListener("resize", checkViewport);
-     { label: "Integrations", icon: Puzzle, href: "/dashboard/ai/integrations" },
+     return () => window.removeEventListener("resize", checkViewport);
-   ];
+   }, []);
-   const bottomItems = [
+   const menuItems = [
-     { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
+     { label: "Overview", icon: LayoutDashboard, href: "/dashboard/ai" },
-     { label: "Settings", icon: Settings, href: "/dashboard/ai/settings" },
+     { label: "Inbox", icon: MessageSquare, href: "/dashboard/ai/inbox" },
-   ];
+     { label: "Bookings", icon: Cal
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [SidebarItemProps, SidebarItem, DashboardSidebar]
- **[convention] Fixed null crash in ListingType — avoids unnecessary re-renders in React — confirmed 3x**: -   const [type, setType] = useState<ListingType>("Homestay");
+   const [address, setAddress] = useState("");
-   const [timezone, setTimezone] = useState("Asia/Kolkata");
+   const [type, setType] = useState<ListingType>("Homestay");
-   const [internalNotes, setInternalNotes] = useState("");
+   const [timezone, setTimezone] = useState("Asia/Kolkata");
-   const [platforms, setPlatforms] = useState<ListingPlatform[]>([]);
+   const [description, setDescription] = useState("");
-   const [externalIcalUrls, setExternalIcalUrls] = useState<
+   const [internalNotes, setInternalNotes] = useState("");
-     Record<ListingPlatform, string>
+   const [images, setImages] = useState<string[]>([]);
-   >({
+   const [amenities, setAmenities] = useState<string[]>([]);
-     airbnb: "",
+   const [platforms, setPlatforms] = useState<ListingPlatform[]>([]);
-     booking: "",
+   const [externalIcalUrls, setExternalIcalUrls] = useState<
-     mmt: "",
+     Record<ListingPlatform, string>
-   });
+   >({
-   const [saving, setSaving] = useState(false);
+     airbnb: "",
-   const [message, setMessage] = useState<string | null>(null);
+     booking: "",
-   const [sessionExpired, setSessionExpired] = useState(false);
+     mmt: "",
-   const [airbnbUrl, setAirbnbUrl] = useState("");
+   });
-   const [isExtracting, setIsExtracting] = useState(false);
+   const [saving, setSaving] = useState(false);
- 
+   const [message, setMessage] = useState<string | null>(null);
-   useEffect(() => {
+   const [sessionExpired, setSessionExpired] = useState(false);
-     fetchDashboardData();
+   const [airbnbUrl, setAirbnbUrl] = useState("");
-   }, [fetchDashboardData]);
+   const [isExtracting, setIsExtracting] = useState(false);
-     if (!capabilities.multi_listing && listings.length > 0) {
+     fetchDashboardData();
-       router.push("/dashboard/ai/listings");
+   }, [fetchDashboardData]);
-     }
+ 
-   }, [capabilities.multi_listing, listings.length, router]);
+   useEffect(() => 
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[convention] Fixed null crash in Search — avoids unnecessary re-renders in React — confirmed 3x**: - import { extractAirbnbInfo } from "@/app/actions/listings";
+ import { cn } from "@/lib/utils";
- import { Search, Loader2, Sparkles } from "lucide-react";
+ import { extractAirbnbInfo } from "@/app/actions/listings";
- 
+ import { Search, Loader2, Sparkles } from "lucide-react";
- const platformLabels: Record<ListingPlatform, string> = {
+ 
-   airbnb: "Airbnb",
+ const platformLabels: Record<ListingPlatform, string> = {
-   booking: "Booking.com",
+   airbnb: "Airbnb",
-   mmt: "MakeMyTrip / GoIbibo",
+   booking: "Booking.com",
- };
+   mmt: "MakeMyTrip / GoIbibo",
- 
+ };
- const listingTypes: ListingType[] = [
+ 
-   "Apartment",
+ const listingTypes: ListingType[] = [
-   "Villa",
+   "Apartment",
-   "Homestay",
+   "Villa",
-   "Guest House",
+   "Homestay",
- ];
+   "Guest House",
- 
+ ];
- export default function AddListingPage() {
+ 
-   const router = useRouter();
+ export default function AddListingPage() {
-   const { tenant, listings, fetchDashboardData } = useDashboardStore();
+   const router = useRouter();
-   const labels = getBusinessLabels(tenant?.businessType);
+   const { tenant, listings, fetchDashboardData } = useDashboardStore();
-   const capabilities = getPersonaCapabilities(tenant?.businessType);
+   const labels = getBusinessLabels(tenant?.businessType);
-   const [step, setStep] = useState(1);
+   const capabilities = getPersonaCapabilities(tenant?.businessType);
-   const [listingId] = useState(() =>
+   const [step, setStep] = useState(1);
-     typeof crypto !== "undefined" && "randomUUID" in crypto
+   const [listingId] = useState(() =>
-       ? crypto.randomUUID()
+     typeof crypto !== "undefined" && "randomUUID" in crypto
-       : `local-${Date.now()}`,
+       ? crypto.randomUUID()
-   );
+       : `local-${Date.now()}`,
-   const [name, setName] = useState("");
+   );
-   const [city, setCity] = useState("");
+   const [name, setName] = useState("");
-   const [type, setType] = useState<ListingType>("Homestay");
+   const
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[decision] decision in page.tsx**: -                     <option key={option} value={option}>
+                     <option key={option} value={option} className="bg-zinc-900 text-white">

📌 IDE AST Context: Modified symbols likely include [platformLabels, listingTypes, AddListingPage]
- **[what-changed] what-changed in WhatsAppBYONCard.tsx**: -               <p className="text-xs text-zinc-500 font-mono tracking-tighter uppercase">Settings > Linked Devices > Link a Device</p>
+               <p className="text-xs text-zinc-500 font-mono tracking-tighter uppercase">Settings &gt; Linked Devices &gt; Link a Device</p>

📌 IDE AST Context: Modified symbols likely include [WhatsAppBYONCardProps, WhatsAppBYONCard]
- **[convention] what-changed in page.tsx — confirmed 3x**: File updated (external): src/app/(customer)/dashboard/ai/listings/page.tsx

Content summary (198 lines):
"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Home, Plus, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";
import {
  getBusinessLabels,
  isCalendarEnabled,
  getPersonaCapabilities,
} from "@/lib/business-context";

export default function ListingsPage() {
  const { listings, fetchDashboardData, isLoading, tenant } =
    useDashboardStor
