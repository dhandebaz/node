"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Calendar as CalendarIcon, 
  MessageSquare, 
  ChevronDown, 
  Loader2,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
  LogIn,
  LogOut,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, isSameDay, parseISO } from "date-fns";
import Link from "next/link";

export default function KaisaDashboardPage() {
  const { 
    listings, 
    bookings, 
    messages, 
    walletBalance, 
    isLoading, 
    error,
    selectedListingId,
    fetchDashboardData,
    setSelectedListingId,
    fetchCalendar
  } = useDashboardStore();

  const { host } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedListingId) {
      // Fetch calendar for current month when listing changes
      fetchCalendar(selectedListingId, {
        start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
        end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString(),
      });
    }
  }, [selectedListingId, currentMonth, fetchCalendar]);

  const selectedListing = listings.find(l => l.id === selectedListingId);

  // Calendar Logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  // --- Mobile Stats Calculation ---
  const today = new Date();
  const checkInsToday = bookings.filter(b => isSameDay(parseISO(b.startDate), today));
  const checkOutsToday = bookings.filter(b => isSameDay(parseISO(b.endDate), today));
  const unreadMessages = messages.filter(m => !m.read).length;

  if (isLoading && !selectedListing) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-red-500 gap-2">
        <AlertCircle className="w-6 h-6" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      
      {/* Mobile Header (Greeting) */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {host?.name ? `Hi, ${host.name.split(' ')[0]}` : 'Hello'}
          </h1>
          <p className="text-white/60 text-sm">Here's what's happening today.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-red)] border border-white/10 flex items-center justify-center text-white font-bold">
           {host?.name ? host.name.charAt(0) : 'U'}
        </div>
      </div>

      {/* --- Mobile View (Vertical Cards) --- */}
      <div className="md:hidden space-y-4">
        
        {/* Today's Check-ins */}
        <Link href="/dashboard/calendar" className="block bg-[#2A0A0A] border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-transform">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
               <LogIn className="w-5 h-5" />
             </div>
             <ArrowRight className="w-4 h-4 text-white/20" />
           </div>
           <div className="text-3xl font-bold text-white mb-1">{checkInsToday.length}</div>
           <div className="text-sm text-white/60 font-medium">Check-ins Today</div>
           {checkInsToday.length > 0 && (
             <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
               {checkInsToday.slice(0, 2).map(b => (
                 <div key={b.id} className="text-xs text-white/80 truncate">• {b.guestName}</div>
               ))}
               {checkInsToday.length > 2 && <div className="text-xs text-white/40">+{checkInsToday.length - 2} more</div>}
             </div>
           )}
        </Link>

        {/* Today's Check-outs */}
        <Link href="/dashboard/calendar" className="block bg-[#2A0A0A] border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-transform">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
               <LogOut className="w-5 h-5" />
             </div>
             <ArrowRight className="w-4 h-4 text-white/20" />
           </div>
           <div className="text-3xl font-bold text-white mb-1">{checkOutsToday.length}</div>
           <div className="text-sm text-white/60 font-medium">Check-outs Today</div>
        </Link>

        {/* New Messages */}
        <Link href="/dashboard/inbox" className="block bg-[#2A0A0A] border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-transform">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
               <MessageSquare className="w-5 h-5" />
             </div>
             {unreadMessages > 0 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
           </div>
           <div className="text-3xl font-bold text-white mb-1">{unreadMessages}</div>
           <div className="text-sm text-white/60 font-medium">New Messages</div>
        </Link>

        {/* Wallet / Earnings */}
        <Link href="/dashboard/kaisa/wallet" className="block bg-gradient-to-br from-[#2A0A0A] to-[#3A1010] border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-transform">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-white/10 text-white rounded-lg">
               <Wallet className="w-5 h-5" />
             </div>
             <ArrowRight className="w-4 h-4 text-white/20" />
           </div>
           <div className="text-3xl font-mono font-bold text-white mb-1">₹{walletBalance.toLocaleString()}</div>
           <div className="text-sm text-white/60 font-medium">Wallet Balance</div>
        </Link>

      </div>


      {/* --- Desktop View (Grid) --- */}
      <div className="hidden md:block space-y-6">
        {/* Top Bar: Selector & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Listing Selector */}
          <div className="relative group">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Selected Property
            </label>
            <div className="relative">
              <select 
                value={selectedListingId || ""}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="appearance-none w-full md:w-80 bg-[#2A0A0A] border border-white/10 text-white text-lg font-medium rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent cursor-pointer shadow-sm hover:border-white/20 transition-colors"
              >
                {listings.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-5 h-5" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2A0A0A] border border-white/10 p-4 rounded-xl shadow-sm min-w-[160px]">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
              </div>
              <div className="text-2xl font-bold text-white">85%</div>
              <div className="text-xs text-green-500 font-medium">+12% vs last month</div>
            </div>
            <div className="bg-[#2A0A0A] border border-white/10 p-4 rounded-xl shadow-sm min-w-[160px]">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Est. Revenue</span>
              </div>
              <div className="text-2xl font-bold text-white">₹{walletBalance.toLocaleString()}</div>
              <div className="text-xs text-white/40 font-medium">This month</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Calendar View (Main) */}
          <div className="xl:col-span-2 bg-[#2A0A0A] border border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[var(--color-brand-red)]" />
                Availability & Bookings
              </h2>
              <div className="flex items-center gap-4">
                 <span className="text-lg font-medium text-white/80">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </span>
                 <div className="flex gap-1">
                   <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60">
                     <ChevronDown className="w-5 h-5 rotate-90" />
                   </button>
                   <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60">
                     <ChevronDown className="w-5 h-5 -rotate-90" />
                   </button>
                 </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
               <div className="grid grid-cols-7 gap-px bg-white/10 rounded-lg overflow-hidden border border-white/10">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-[#1E0B0B] p-3 text-center text-xs font-bold uppercase text-white/50">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-[#2A0A0A] min-h-[100px]" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    
                    // Find bookings for this day
                    const daysBookings = bookings.filter(b => {
                       const start = new Date(b.startDate);
                       const end = new Date(b.endDate);
                       return dateObj >= start && dateObj <= end;
                    });

                    return (
                      <div key={day} className="bg-[#2A0A0A] min-h-[100px] p-2 hover:bg-white/5 transition-colors border-t border-white/5 relative">
                        <span className={cn(
                          "text-sm font-medium block mb-1",
                          dateObj.toDateString() === new Date().toDateString() ? "text-white bg-[var(--color-brand-red)] w-6 h-6 flex items-center justify-center rounded-full" : "text-white/60"
                        )}>
                          {day}
                        </span>
                        <div className="space-y-1">
                          {daysBookings.map(b => (
                            <div 
                              key={b.id} 
                              className={cn(
                                "text-[10px] px-1.5 py-1 rounded font-medium truncate border",
                                b.status === 'confirmed' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                b.status === 'blocked' ? "bg-white/10 text-white/40 border-white/10" :
                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              )}
                            >
                              {b.guestName}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>

          {/* Messages & Actions (Side) */}
          <div className="space-y-6">
            
            {/* Messages */}
            <div className="bg-[#2A0A0A] border border-white/10 rounded-2xl shadow-sm overflow-hidden h-[400px] flex flex-col">
               <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[var(--color-brand-red)]" />
                    Recent Messages
                  </h2>
                  <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                    {messages.filter(m => !m.read).length} New
                  </span>
               </div>
               <div className="flex-1 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 p-8 text-center">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No new messages</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {messages.map(m => (
                        <div key={m.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-sm text-white group-hover:text-[var(--color-brand-red)] transition-colors">
                               {m.guestName}
                             </span>
                             <span className="text-[10px] text-white/40">
                               {format(new Date(m.timestamp), 'MMM d, h:mm a')}
                             </span>
                          </div>
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                            {m.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               <div className="p-3 border-t border-white/10 bg-[#1E0B0B] text-center">
                  <button className="text-xs font-bold text-[var(--color-brand-red)] hover:text-white transition-colors">
                    View All Messages
                  </button>
               </div>
            </div>

            {/* Sync Status */}
            <div className="bg-[var(--color-brand-dark-bg)] text-white rounded-2xl p-6 relative overflow-hidden border border-white/10">
               <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2">Calendar Sync Active</h3>
                 <p className="text-sm text-white/70 mb-4">
                   Your calendar is automatically syncing with Airbnb, Booking.com, and VRBO every 5 minutes.
                 </p>
                 <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1.5" />
                   <span className="text-xs font-mono text-green-400">LAST SYNC: JUST NOW</span>
                 </div>
               </div>
               {/* Decor */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-red)] opacity-10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
