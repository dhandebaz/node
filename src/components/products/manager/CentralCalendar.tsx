"use client";

import { useState, useEffect } from "react";
import { listingsApi } from "@/lib/api/listings";
import { Booking } from "@/types";
import { Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function CentralCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const data = await listingsApi.getCalendar("demo-listing", {
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
    <div className="w-full max-w-4xl mx-auto bg-brand-bone/5 rounded-xl border border-brand-bone/10 overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-brand-bone/10 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-2 text-brand-bone">
          <CalendarIcon className="w-5 h-5 text-brand-bone/60" />
          <span className="font-medium text-lg">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-brand-bone/10 rounded transition-colors text-brand-bone">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-brand-bone/10 rounded transition-colors text-brand-bone">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-bone/40" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-brand-bone/10 rounded-lg overflow-hidden border border-brand-bone/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-brand-deep-red p-2 text-center text-xs font-mono uppercase text-brand-bone/40">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-black/20 min-h-[100px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
              // Simple check if date is within any booking range (very naive for demo)
              const booking = bookings.find(b => {
                 const start = new Date(b.startDate);
                 const end = new Date(b.endDate);
                 const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                 return current >= start && current <= end;
              });

              return (
                <div key={day} className="bg-black/20 min-h-[100px] p-2 relative group hover:bg-brand-bone/5 transition-colors">
                  <span className="text-sm text-brand-bone/60 font-mono">{day}</span>
                  {booking && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-2 p-1.5 rounded text-xs font-medium truncate ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        booking.status === 'blocked' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {booking.source === 'airbnb' ? 'Airbnb' : 'Direct'}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
