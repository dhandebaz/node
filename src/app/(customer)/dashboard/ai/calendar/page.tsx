"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { 
  Calendar as CalendarIcon, 
  List, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock,
  Plus,
  X
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { paymentsApi } from "@/lib/api/payments";

export default function CalendarPage() {
  const { 
    listings, 
    bookings, 
    fetchDashboardData, 
    fetchCalendar, 
    selectedListingId, 
    setSelectedListingId,
    isLoading,
    tenant
  } = useDashboardStore();

  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const isDoctor = tenant?.businessType === "doctor_clinic";

  const [view, setView] = useState<'agenda' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    listingId: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    amount: "",
    checkIn: "",
    checkOut: "",
    notes: ""
  });
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSent, setPaymentSent] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (tenant?.businessType === 'doctor_clinic') {
      setView('agenda');
    }
  }, [tenant?.businessType]);

  useEffect(() => {
    if (selectedListingId && selectedListingId !== "all") {
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();
      fetchCalendar(selectedListingId, { start, end });
    } else if (selectedListingId === "all") {
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();
      fetchCalendar("all", { start, end });
    } else if (listings.length > 0) {
      setSelectedListingId(listings.length > 1 ? "all" : listings[0].id);
    }
  }, [selectedListingId, listings, currentDate, fetchCalendar, setSelectedListingId]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const statusDisplay = (status: string) => {
    if (status === "confirmed" || status === "paid") {
      return { label: "confirmed", text: "text-green-400", dot: "bg-green-500" };
    }
    if (status === "payment_pending" || status === "pending") {
      return { label: "payment pending", text: "text-amber-300", dot: "bg-amber-400" };
    }
    if (status === "draft") {
      return { label: "draft", text: "text-white/50", dot: "bg-white/30" };
    }
    if (status === "cancelled" || status === "refunded") {
      return { label: status.replace("_", " "), text: "text-red-400", dot: "bg-red-500" };
    }
    if (status === "blocked") {
      return { label: "blocked", text: "text-blue-300", dot: "bg-blue-400" };
    }
    return { label: status, text: "text-white/60", dot: "bg-white/40" };
  };

  const openPaymentModal = () => {
    const listingId = selectedListingId === "all" ? listings[0]?.id || "" : selectedListingId || listings[0]?.id || "";
    setPaymentForm({
      listingId,
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      amount: "",
      checkIn: "",
      checkOut: "",
      notes: ""
    });
    setPaymentLink(null);
    setPaymentMessage("");
    setPaymentError(null);
    setPaymentSent(false);
    setShowPaymentModal(true);
  };

  const handleCreatePaymentLink = async () => {
    if (!paymentForm.listingId || !paymentForm.guestName || !paymentForm.amount || !paymentForm.checkIn || !paymentForm.checkOut) {
      setPaymentError("Fill all required fields.");
      return;
    }
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      const effectiveListingId = paymentForm.listingId;
      const payload = {
        listingId: effectiveListingId,
        guestName: paymentForm.guestName.trim(),
        guestPhone: paymentForm.guestPhone.trim() || null,
        guestEmail: paymentForm.guestEmail.trim() || null,
        amount: Number(paymentForm.amount),
        checkIn: paymentForm.checkIn,
        checkOut: paymentForm.checkOut,
        notes: paymentForm.notes.trim() || null
      };
      const data = await paymentsApi.createPaymentLink(payload);
      const listingName = listings.find((l) => l.id === effectiveListingId)?.name || "your stay";
      const message = `Booking for ${listingName} (${paymentForm.checkIn}–${paymentForm.checkOut}) is pending. Please pay ₹${Number(paymentForm.amount).toLocaleString("en-IN")} here: ${data.paymentLink}`;
      setPaymentLink(data.paymentLink);
      setPaymentMessage(message);
      setPaymentSent(true);
      const range = { start: startOfMonth(currentDate).toISOString(), end: endOfMonth(currentDate).toISOString() };
      if (selectedListingId === "all") {
        await fetchCalendar("all", range);
      } else {
        await fetchCalendar(effectiveListingId, range);
      }
    } catch {
      setPaymentError("Failed to create payment link.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Calendar Grid Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday

  if (!capabilities.calendar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-white/10 text-white/40">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Calendar Not Available</h3>
          <p className="text-white/60">
            Calendar is not enabled for your business type yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sticky top-0 bg-[var(--color-brand-red)] z-30 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{labels.calendar}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-white/20 text-white/80 hover:border-white/50"
            >
              <Plus className="w-4 h-4" />
              Create {labels.booking.toLowerCase()}
            </button>
            <div className="flex bg-[var(--color-dashboard-surface)] p-1 rounded-lg border border-white/10">
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
        </div>

        {/* Listing Selector */}
        <div className="relative">
          <select 
            value={selectedListingId || ""}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="w-full appearance-none bg-[var(--color-dashboard-surface)] border border-white/10 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-white/30 font-medium"
          >
            {listings.length > 1 && (
              <option value="all">All {labels.listings.toLowerCase()}</option>
            )}
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
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
            <div className="text-center py-10 text-white/40 dashboard-surface">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No bookings yet</p>
            </div>
          ) : (
            bookings
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map(booking => (
              <div key={booking.id} className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{booking.guestName || labels.customer}</h3>
                    <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                      <span className="capitalize">{booking.source}</span>
                      <span>•</span>
                      <span className={cn(
                        "uppercase font-bold tracking-wider",
                        statusDisplay(booking.status).text
                      )}>{statusDisplay(booking.status).label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">{labels.checkIn}</div>
                    <div className="font-bold text-white">{format(parseISO(booking.startDate), isDoctor ? 'h:mm a' : 'MMM d')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 py-3 border-t border-white/5 border-b mb-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                       <Clock className="w-3 h-3" />
                       {labels.checkIn}
                     </div>
                     <div className="font-medium text-white">{format(parseISO(booking.startDate), isDoctor ? 'EEE, MMM d • h:mm a' : 'EEE, MMM d')}</div>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="flex-1">
                     <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                       <Clock className="w-3 h-3" />
                       {labels.checkOut}
                     </div>
                     <div className="font-medium text-white">{format(parseISO(booking.endDate), isDoctor ? 'EEE, MMM d • h:mm a' : 'EEE, MMM d')}</div>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs text-white/40">
                     <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {selectedListingId === "all"
                        ? listings.find(l => l.id === booking.listingId)?.name || "All properties"
                        : listings.find(l => l.id === selectedListingId)?.name}
                    </span>
                   </div>
                  <a
                    href={selectedListingId === "all" ? "/dashboard/kaisa/listings" : `/dashboard/kaisa/listings/${selectedListingId}`}
                    className="text-xs font-bold text-[var(--color-brand-red)] bg-white px-3 py-1.5 rounded-lg"
                  >
                    View listing
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl overflow-hidden">
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
                  <div className="absolute top-1 right-1 flex gap-1">
                    {dayBookings.some(b => (b as any).idStatus && (b as any).idStatus !== "approved") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="ID pending" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayBookings.map(b => (
                      <div key={b.id} className={cn(
                        "h-1.5 rounded-full w-full",
                        statusDisplay(b.status).dot
                      )} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Create {labels.booking.toLowerCase()} payment link</div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.listing}</label>
                  <select
                    value={paymentForm.listingId}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, listingId: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="">Select {labels.listing.toLowerCase()}</option>
                    {listings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Amount</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="Amount in INR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.customer} name</label>
                  <input
                    type="text"
                    value={paymentForm.guestName}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestName: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder={`${labels.customer} name`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.customer} phone</label>
                  <input
                    type="tel"
                    value={paymentForm.guestPhone}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestPhone: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.customer} email</label>
                  <input
                    type="email"
                    value={paymentForm.guestEmail}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestEmail: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="guest@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.checkIn}</label>
                  <input
                    type="date"
                    value={paymentForm.checkIn}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, checkIn: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">{labels.checkOut}</label>
                  <input
                    type="date"
                    value={paymentForm.checkOut}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, checkOut: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Notes (optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 min-h-[80px]"
                  placeholder="Add any notes for the guest"
                />
              </div>

              {paymentLink && (
                <div className="space-y-3 border border-white/10 rounded-xl p-4 bg-white/5">
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">Payment link</div>
                  <div className="text-sm text-white break-all">{paymentLink}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        if (!paymentLink) return;
                        await navigator.clipboard.writeText(paymentLink);
                        setPaymentSent(true);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                    >
                      Copy link
                    </button>
                    {paymentMessage && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(paymentMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                      >
                        WhatsApp
                      </a>
                    )}
                    {paymentMessage && paymentForm.guestPhone && (
                      <a
                        href={`sms:${paymentForm.guestPhone}?body=${encodeURIComponent(paymentMessage)}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                      >
                        SMS
                      </a>
                    )}
                    {paymentMessage && paymentForm.guestEmail && (
                      <a
                        href={`mailto:${paymentForm.guestEmail}?subject=Booking%20payment&body=${encodeURIComponent(paymentMessage)}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                      >
                        Email
                      </a>
                    )}
                  </div>
                  {paymentSent && (
                    <div className="text-xs text-emerald-300">Payment link ready to share.</div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-red-300">{paymentError}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleCreatePaymentLink}
                  disabled={paymentLoading}
                  className="px-4 py-2 bg-[var(--color-brand-red)] text-white rounded-lg text-xs font-semibold disabled:opacity-60"
                >
                  {paymentLoading ? "Generating..." : paymentLink ? "Generate again" : "Generate payment link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
