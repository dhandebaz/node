"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { paymentsApi } from "@/lib/api/payments";
import { BookingRecord, PaymentRecord } from "@/types";
import { Calendar, ExternalLink, Loader2, Plus, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type BookingDetail = {
  booking: BookingRecord;
  payment: PaymentRecord | null;
};

type ListingSummary = {
  id: string;
  name: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingRecord["status"] | "all">("all");
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

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingData, listingData] = await Promise.all([
        fetchWithAuth<BookingRecord[]>("/api/bookings"),
        fetchWithAuth<ListingSummary[]>("/api/listings")
      ]);
      setBookings(bookingData || []);
      setListings(listingData || []);
      if (!selectedId && bookingData?.length) {
        setSelectedId(bookingData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const data = await fetchWithAuth<BookingDetail>(`/api/bookings/${id}`);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    }
  }, [selectedId]);

  const statusDisplay = (status: string) => {
    if (status === "confirmed" || status === "paid") {
      return { label: "confirmed", text: "text-green-400", badge: "bg-green-500/10 text-green-300" };
    }
    if (status === "payment_pending" || status === "pending") {
      return { label: "payment pending", text: "text-amber-300", badge: "bg-amber-500/10 text-amber-300" };
    }
    if (status === "draft") {
      return { label: "draft", text: "text-white/50", badge: "bg-white/5 text-white/50" };
    }
    if (status === "cancelled" || status === "refunded") {
      return { label: status.replace("_", " "), text: "text-red-300", badge: "bg-red-500/10 text-red-300" };
    }
    if (status === "blocked") {
      return { label: "blocked", text: "text-blue-300", badge: "bg-blue-500/10 text-blue-300" };
    }
    return { label: status, text: "text-white/60", badge: "bg-white/5 text-white/60" };
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => (statusFilter === "all" ? true : booking.status === statusFilter));
  }, [bookings, statusFilter]);

  const openPaymentModal = () => {
    const listingId = listings[0]?.id || "";
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
      const payload = {
        listingId: paymentForm.listingId,
        guestName: paymentForm.guestName.trim(),
        guestPhone: paymentForm.guestPhone.trim() || null,
        guestEmail: paymentForm.guestEmail.trim() || null,
        amount: Number(paymentForm.amount),
        checkIn: paymentForm.checkIn,
        checkOut: paymentForm.checkOut,
        notes: paymentForm.notes.trim() || null
      };
      const data = await paymentsApi.createPaymentLink(payload);
      const listingName = listings.find((l) => l.id === paymentForm.listingId)?.name || "your stay";
      const message = `Booking for ${listingName} (${paymentForm.checkIn}–${paymentForm.checkOut}) is pending. Please pay ₹${Number(paymentForm.amount).toLocaleString("en-IN")} here: ${data.paymentLink}`;
      setPaymentLink(data.paymentLink);
      setPaymentMessage(message);
      await loadBookings();
    } catch {
      setPaymentError("Failed to create payment link.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!detail?.booking?.id) return;
    await fetchWithAuth(`/api/bookings/${detail.booking.id}/cancel`, { method: "POST" });
    await loadBookings();
    await loadDetail(detail.booking.id);
  };

  const formatDate = (value: string) => format(parseISO(value), "d MMM yyyy");

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Bookings</h1>
          <p className="text-sm text-white/50">Track direct and OTA bookings with payment status.</p>
        </div>
        <button
          onClick={openPaymentModal}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-white/20 text-white/80 hover:border-white/50"
        >
          <Plus className="w-4 h-4" />
          Create booking
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/70">
        {(["all", "draft", "payment_pending", "confirmed", "cancelled", "refunded"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1.5 rounded-full border",
              statusFilter === status ? "border-white/60 text-white" : "border-white/10 text-white/60"
            )}
          >
            {status === "all" ? "All status" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Bookings list</div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
          </div>
          {error && (
            <div className="p-6 text-sm text-white/50">{error}</div>
          )}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="p-6 text-sm text-white/50">No bookings found.</div>
          )}
          <div className="divide-y divide-white/5">
            {filteredBookings.map((booking) => {
              const listingName = listings.find((l) => l.id === booking.listing_id)?.name || "Property";
              const statusMeta = statusDisplay(booking.status);
              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedId(booking.id)}
                  className={cn(
                    "w-full text-left px-4 py-4 hover:bg-white/5 transition-colors border-l-2",
                    selectedId === booking.id ? "bg-white/5 border-[var(--color-brand-red)]" : "border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">{booking.guest_name}</div>
                      <div className="text-xs text-white/40">{listingName}</div>
                      <div className="text-xs text-white/50 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm font-semibold text-white">₹{Number(booking.amount || 0).toLocaleString("en-IN")}</div>
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusMeta.badge}`}>
                        {statusMeta.label}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">{booking.source || "direct"}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Booking detail</div>
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading booking...
            </div>
          )}
          {!detailLoading && !detail && (
            <div className="text-sm text-white/50">Select a booking to view details.</div>
          )}
          {detail?.booking && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-white">{detail.booking.guest_name}</div>
                <div className="text-xs text-white/50">{detail.booking.guest_contact || "No contact provided"}</div>
                <div className="text-xs text-white/50">
                  {formatDate(detail.booking.check_in)} → {formatDate(detail.booking.check_out)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-white/40">Amount</div>
                  <div className="text-white mt-1">₹{Number(detail.booking.amount || 0).toLocaleString("en-IN")}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-white/40">Status</div>
                  <div className={cn("mt-1", statusDisplay(detail.booking.status).text)}>
                    {statusDisplay(detail.booking.status).label}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-white/40">Payment</div>
                  <div className="text-white mt-1">{detail.payment?.status || "not created"}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-white/40">Source</div>
                  <div className="text-white mt-1">{detail.booking.source || "direct"}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                <div className="text-xs text-white/40">Payment link</div>
                {detail.payment?.payment_link ? (
                  <a
                    href={detail.payment.payment_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white/80 inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Razorpay link
                  </a>
                ) : (
                  <div className="text-xs text-white/50">Not generated yet</div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                <div className="text-xs text-white/40">Linked conversation</div>
                <div className="text-xs text-white/60">Not linked yet</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCancelBooking}
                  className="px-3 py-1.5 text-xs font-semibold border border-white/20 text-white/70 rounded-full"
                >
                  Cancel booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Create booking payment link</div>
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
                  <label className="block text-xs font-semibold text-white/60 mb-1">Property</label>
                  <select
                    value={paymentForm.listingId}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, listingId: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="">Select property</option>
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
                  <label className="block text-xs font-semibold text-white/60 mb-1">Guest name</label>
                  <input
                    type="text"
                    value={paymentForm.guestName}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestName: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Guest phone</label>
                  <input
                    type="tel"
                    value={paymentForm.guestPhone}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestPhone: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Guest email</label>
                  <input
                    type="email"
                    value={paymentForm.guestEmail}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, guestEmail: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="guest@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={paymentForm.checkIn}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, checkIn: event.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Check-out</label>
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
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(paymentMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                    >
                      WhatsApp
                    </a>
                    {paymentForm.guestPhone && (
                      <a
                        href={`sms:${paymentForm.guestPhone}?body=${encodeURIComponent(paymentMessage)}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                      >
                        SMS
                      </a>
                    )}
                    {paymentForm.guestEmail && (
                      <a
                        href={`mailto:${paymentForm.guestEmail}?subject=Booking%20payment&body=${encodeURIComponent(paymentMessage)}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold border border-white/20 text-white/80 px-3 py-1.5 rounded-full"
                      >
                        Email
                      </a>
                    )}
                  </div>
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
