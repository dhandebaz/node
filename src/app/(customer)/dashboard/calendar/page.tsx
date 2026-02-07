"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { 
  Calendar as CalendarIcon, 
  List, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { 
    listings, 
    bookings, 
    fetchDashboardData, 
    fetchCalendar, 
    selectedListingId, 
    setSelectedListingId,
    isLoading 
  } = useDashboardStore();

  const [view, setView] = useState<'agenda' | 'month'>('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedListingId) {
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();
      fetchCalendar(selectedListingId, { start, end });
    } else if (listings.length > 0) {
      setSelectedListingId(listings[0].id);
    }
  }, [selectedListingId, listings, currentDate, fetchCalendar, setSelectedListingId]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Calendar Grid Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sticky top-0 bg-[var(--color-brand-red)] z-30 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Calendar</h1>
          <div className="flex bg-[#2A0A0A] p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setView('agenda')}
              className={cn(
                "p-2 rounded-md transition-all",
                view === 'agenda' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('month')}
              className={cn(
                "p-2 rounded-md transition-all",
                view === 'month' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listing Selector */}
        <div className="relative">
          <select 
            value={selectedListingId || ""}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="w-full appearance-none bg-[#2A0A0A] border border-white/10 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-white/30 font-medium"
          >
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-5 h-5" />
        </div>
      </div>

      {/* Content */}
      {view === 'agenda' ? (
        <div className="space-y-3">
          {isLoading && bookings.length === 0 ? (
            <div className="text-center py-10 text-white/40">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-white/40 bg-white/5 rounded-2xl border border-white/5">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No bookings for this month</p>
            </div>
          ) : (
            bookings
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map(booking => (
              <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{booking.guestName || "Guest"}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                      <span className="capitalize">{booking.source}</span>
                      <span>•</span>
                      <span className={cn(
                        "uppercase font-bold tracking-wider",
                        booking.status === 'confirmed' ? "text-green-400" : "text-yellow-400"
                      )}>{booking.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">Check-in</div>
                    <div className="font-bold text-white">{format(parseISO(booking.startDate), 'MMM d')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 py-3 border-t border-white/5 border-b mb-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                       <Clock className="w-3 h-3" />
                       Check-in
                     </div>
                     <div className="font-medium text-white">{format(parseISO(booking.startDate), 'EEE, MMM d')}</div>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="flex-1">
                     <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                       <Clock className="w-3 h-3" />
                       Check-out
                     </div>
                     <div className="font-medium text-white">{format(parseISO(booking.endDate), 'EEE, MMM d')}</div>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs text-white/40">
                     <MapPin className="w-3 h-3" />
                     <span className="truncate max-w-[150px]">{listings.find(l => l.id === selectedListingId)?.title}</span>
                   </div>
                   <button className="text-xs font-bold text-[var(--color-brand-red)] bg-white px-3 py-1.5 rounded-lg">
                     Details
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[#2A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full text-white/60">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full text-white/60">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 text-center border-b border-white/10 bg-white/5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="py-2 text-[10px] font-bold text-white/40">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)]">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-white/5" />
            ))}
            {days.map(day => {
              const isToday = isSameDay(day, new Date());
              const dayBookings = bookings.filter(b => 
                isWithinInterval(day, { start: parseISO(b.startDate), end: parseISO(b.endDate) })
              );
              
              return (
                <div key={day.toISOString()} className={cn(
                  "border-b border-r border-white/5 p-1 relative min-h-[60px]",
                  dayBookings.length > 0 && "bg-white/[0.02]"
                )}>
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    isToday ? "bg-[var(--color-brand-red)] text-white" : "text-white/60"
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-col gap-1">
                    {dayBookings.map(b => (
                      <div key={b.id} className={cn(
                        "h-1.5 rounded-full w-full",
                        b.status === 'confirmed' ? "bg-green-500" : "bg-yellow-500"
                      )} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
