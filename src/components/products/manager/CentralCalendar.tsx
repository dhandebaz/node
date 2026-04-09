"use client";

import { useState, useEffect } from "react";
import { listingsApi } from "@/lib/api/listings";
import { Booking } from "@/types";
import { Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CentralCalendarProps {
  listingId?: string;
}

export function CentralCalendar({ listingId = "demo-listing" }: CentralCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const data = await listingsApi.getCalendar(listingId, {
          start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
          end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString(),
        });
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch calendar", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [currentMonth]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <span className="font-black text-xl text-zinc-950 uppercase tracking-tighter">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-500 hover:text-zinc-950 border border-transparent hover:border-zinc-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-500 hover:text-zinc-950 border border-transparent hover:border-zinc-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-[1.5rem] overflow-hidden border border-zinc-200 shadow-inner">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-zinc-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white/50 min-h-[120px]" />
            ))}
 
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
              const booking = bookings.find(b => {
                 const start = new Date(b.startDate);
                 const end = new Date(b.endDate);
                 const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                 return current >= start && current <= end;
              });

              return (
                <div key={day} className="bg-white min-h-[120px] p-3 relative group hover:bg-zinc-50 transition-colors">
                  <span className="text-sm text-zinc-400 font-black tracking-tighter">{day}</span>
                  {booking && (
                    <motion.div 
                      layoutId={`booking-${booking.id}-${day}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-2 p-2 rounded-xl text-[10px] font-black uppercase tracking-tight truncate border shadow-sm ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        booking.status === 'blocked' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      {booking.source === 'direct' ? 'Direct' : 'Sync: ' + booking.source.toUpperCase()}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="px-8 py-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
          <span className="text-zinc-500">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-400 shadow-lg shadow-zinc-400/20" />
          <span className="text-zinc-500">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-500/20" />
          <span className="text-zinc-500">Sync Connector</span>
        </div>
      </div>
    </div>
  );
}
