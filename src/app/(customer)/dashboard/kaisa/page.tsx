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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

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

  if (isLoading && !selectedListing) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Top Bar: Selector & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Listing Selector */}
        <div className="relative group">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Selected Property
          </label>
          <div className="relative">
            <select 
              value={selectedListingId || ""}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="appearance-none w-full md:w-80 bg-white border border-gray-200 text-gray-900 text-lg font-medium rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
            >
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm min-w-[160px]">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-xs text-green-600 font-medium">+12% vs last month</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm min-w-[160px]">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Est. Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</div>
            <div className="text-xs text-gray-400 font-medium">This month</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Calendar View (Main) */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[var(--color-brand-red)]" />
              Availability & Bookings
            </h2>
            <div className="flex items-center gap-4">
               <span className="text-lg font-medium text-gray-700">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
               </span>
               <div className="flex gap-1">
                 <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                   <ChevronDown className="w-5 h-5 rotate-90" />
                 </button>
                 <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                   <ChevronDown className="w-5 h-5 -rotate-90" />
                 </button>
               </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
             <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold uppercase text-gray-500">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white min-h-[100px]" />
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
                    <div key={day} className="bg-white min-h-[100px] p-2 hover:bg-gray-50 transition-colors border-t border-gray-100 relative">
                      <span className={cn(
                        "text-sm font-medium block mb-1",
                        dateObj.toDateString() === new Date().toDateString() ? "text-[var(--color-brand-red)] bg-red-50 w-6 h-6 flex items-center justify-center rounded-full" : "text-gray-700"
                      )}>
                        {day}
                      </span>
                      <div className="space-y-1">
                        {daysBookings.map(b => (
                          <div 
                            key={b.id} 
                            className={cn(
                              "text-[10px] px-1.5 py-1 rounded font-medium truncate border",
                              b.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-100" :
                              b.status === 'blocked' ? "bg-gray-100 text-gray-500 border-gray-200" :
                              "bg-blue-50 text-blue-700 border-blue-100"
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-[400px] flex flex-col">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[var(--color-brand-red)]" />
                  Recent Messages
                </h2>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {messages.filter(m => !m.read).length} New
                </span>
             </div>
             <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No new messages</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {messages.map(m => (
                      <div key={m.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-brand-red)] transition-colors">
                             {m.guestName}
                           </span>
                           <span className="text-[10px] text-gray-400">
                             {format(new Date(m.timestamp), 'MMM d, h:mm a')}
                           </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
             <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                <button className="text-xs font-bold text-[var(--color-brand-red)] hover:underline">
                  View All Messages
                </button>
             </div>
          </div>

          {/* Sync Status */}
          <div className="bg-[var(--color-brand-dark-bg)] text-white rounded-2xl p-6 relative overflow-hidden">
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
  );
}
