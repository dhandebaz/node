"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { paymentsApi } from "@/lib/api/payments";
import { BookingRecord, PaymentRecord } from "@/types";
import { Calendar, ExternalLink, Loader2, Plus, X, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels, getPersonaCapabilities } from "@/lib/business-context";
import { BookingActivityTimeline } from "@/components/dashboard/BookingActivityTimeline";

type BookingDetail = {
  booking: BookingRecord;
  payment: PaymentRecord | null;
};

type ListingSummary = {
  id: string;
  name: string;
};

export default function BookingsPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);
  const capabilities = getPersonaCapabilities(tenant?.businessType);
  const isDoctor = tenant?.businessType === 'doctor_clinic';
  const isKirana = tenant?.businessType === 'kirana_store';

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
  const [idRecord, setIdRecord] = useState<any | null>(null);
  const [idLoading, setIdLoading] = useState(false);
  const [requestingId, setRequestingId] = useState(false);
  const [idMessage, setIdMessage] = useState<string | null>(null);
  const [idRequestMessage, setIdRequestMessage] = useState<string | null>(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [idType, setIdType] = useState<"aadhaar" | "passport" | "driving_license" | "voter_id" | "any">("aadhaar");
  const [idNote, setIdNote] = useState("");
  const [idUploadUrl, setIdUploadUrl] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [blurred, setBlurred] = useState(true);

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
      setIdRecord(null);
      setIdUploadUrl(null);
      setBlurred(true);
      setIdMessage(null);
      setIdRequestMessage(null);
      setRejectReason("");
      if (data?.booking?.id) {
        setIdLoading(true);
        const idData = await fetchWithAuth(`/api/guest-id/${data.booking.id}`).catch(() => null);
        setIdRecord(idData);
        setIdLoading(false);
      }
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
      if (isKirana) return { label: "Packed", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-300" };
      if (isDoctor) return { label: "Scheduled", text: "text-blue-400", badge: "bg-blue-500/10 text-blue-300" };
      return { label: "Confirmed", text: "text-green-400", badge: "bg-green-500/10 text-green-300" };
    }
    if (status === "payment_pending" || status === "pending") {
      return { label: "Payment Pending", text: "text-amber-300", badge: "bg-amber-500/10 text-amber-300" };
    }
    if (status === "draft") {
      return { label: "Draft", text: "text-white/50", badge: "bg-white/5 text-white/50" };
    }
    if (status === "cancelled" || status === "refunded") {
      return { label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "), text: "text-red-300", badge: "bg-red-500/10 text-red-300" };
    }
    if (status === "blocked") {
      return { label: "Blocked", text: "text-blue-300", badge: "bg-blue-500/10 text-blue-300" };
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
      const listingName = listings.find((l) => l.id === paymentForm.listingId)?.name || labels.listing;
      const message = `${labels.booking} for ${listingName} (${paymentForm.checkIn}–${paymentForm.checkOut}) is pending. Please pay ₹${Number(paymentForm.amount).toLocaleString("en-IN")} here: ${data.paymentLink}`;
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

  const idStatusLabel = (status?: string | null) => {
    if (!status || status === "not_requested") return "Not requested";
    if (status === "requested") return "Requested";
    if (status === "submitted") return "Submitted";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return status;
  };

  const idStatusIcon = (status?: string | null) => {
    if (status === "approved") return ShieldCheck;
    if (status === "rejected") return ShieldAlert;
    if (status === "submitted") return Shield;
    return Shield;
  };

  const requestGuestId = async () => {
    if (!detail?.booking?.id) return;
    try {
      setRequestingId(true);
      setIdMessage(null);
      const response = await fetchWithAuth<{ bookingId: string; uploadUrl: string; message: string }>("/api/guest-id/request", {
        method: "POST",
        body: JSON.stringify({
          bookingId: detail.booking.id,
          idType,
          message: idNote.trim() || null
        })
      });
      setIdUploadUrl(response.uploadUrl);
      setIdRequestMessage(response.message);
      setIdMessage(`Upload link generated. Share with the ${labels.customer.toLowerCase()}.`);
      await loadBookings();
      await loadDetail(detail.booking.id);
    } catch (error: any) {
      setIdMessage(error?.message || "Failed to request ID.");
    } finally {
      setRequestingId(false);
    }
  };

  const approveGuestId = async () => {
    if (!idRecord?.id || !detail?.booking?.id) return;
    try {
      setReviewLoading(true);
      await fetchWithAuth(`/api/guest-id/approve/${idRecord.id}`, { method: "POST" });
      await loadBookings();
      await loadDetail(detail.booking.id);
    } finally {
      setReviewLoading(false);
    }
  };

  const rejectGuestId = async () => {
    if (!idRecord?.id || !detail?.booking?.id) return;
    try {
      setReviewLoading(true);
      await fetchWithAuth(`/api/guest-id/reject/${idRecord.id}`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() || "Please upload a clearer ID image." })
      });
      setRejectReason("");
      await loadBookings();
      await loadDetail(detail.booking.id);
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (value: string) => format(parseISO(value), "d MMM yyyy");
  
  const formatBookingDate = (value: string) => {
    if (!value) return "";
    try {
      if (isDoctor) {
        return format(parseISO(value), "MMM d, h:mm a");
      }
      return format(parseISO(value), "d MMM yyyy");
    } catch (e) {
      return value;
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{labels.bookings}</h1>
          <p className="text-sm text-white/50">Track direct and OTA {labels.bookings.toLowerCase()} with payment status.</p>
        </div>
        <button
          onClick={openPaymentModal}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-white/20 text-white/80 hover:border-white/50"
        >
          <Plus className="w-4 h-4" />
          Create {labels.booking.toLowerCase()}
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
            <div className="text-sm font-semibold text-white">{labels.bookings} list</div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
          </div>
          {error && (
            <div className="p-6 text-sm text-white/50">{error}</div>
          )}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="p-6 text-sm text-white/50">No {labels.bookings.toLowerCase()} found.</div>
          )}
          <div className="divide-y divide-white/5">
            {filteredBookings.map((booking) => {
              const listingName = listings.find((l) => l.id === booking.listing_id)?.name || labels.listing;
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
                        {formatBookingDate(booking.check_in)} → {formatBookingDate(booking.check_out)}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm font-semibold text-white">₹{Number(booking.amount || 0).toLocaleString("en-IN")}</div>
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusMeta.badge}`}>
                        {statusMeta.label}
                      </div>
                      {capabilities.id_verification && (
                        <div className="text-[10px] text-white/50 uppercase tracking-wider">
                          ID {idStatusLabel(booking.id_status)}
                        </div>
                      )}
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">{booking.source || "direct"}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="text-sm font-semibold text-white">{labels.booking} detail</div>
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading {labels.booking.toLowerCase()}...
            </div>
          )}
          {!detailLoading && !detail && (
            <div className="text-sm text-white/50">Select a {labels.booking.toLowerCase()} to view details.</div>
          )}
          {detail?.booking && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-white">{detail.booking.guest_name}</div>
                <div className="text-xs text-white/50">{detail.booking.guest_contact || "No contact provided"}</div>
                <div className="text-xs text-white/50">
                  {formatBookingDate(detail.booking.check_in)} → {formatBookingDate(detail.booking.check_out)}
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
                  Cancel {labels.booking.toLowerCase()}
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/40">ID Verification</div>
                    <div className="text-sm text-white">
                      {capabilities.id_verification ? idStatusLabel((detail.booking as any).id_status) : "Not required"}
                    </div>
                  </div>
                  {capabilities.id_verification && (
                    <button
                      onClick={() => setShowIdModal(true)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:border-white/50"
                    >
                      Request ID
                    </button>
                  )}
                </div>

                {idLoading && (
                  <div className="text-xs text-white/50 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading ID...
                  </div>
                )}

                {idRecord && (
                  <div className="space-y-2">
                    <div className="text-xs text-white/50">Type: {idRecord.id_type}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative border border-white/10 rounded-lg overflow-hidden">
                        <img
                          src={`/api/guest-id/${idRecord.id}/image?side=front`}
                          alt="Front ID"
                          className={cn("w-full h-40 object-cover", blurred && "blur-sm")}
                        />
                      </div>
                      <div className="relative border border-white/10 rounded-lg overflow-hidden">
                        {idRecord.back_image_path ? (
                          <img
                            src={`/api/guest-id/${idRecord.id}/image?side=back`}
                            alt="Back ID"
                            className={cn("w-full h-40 object-cover", blurred && "blur-sm")}
                          />
                        ) : (
                          <div className="min-h-[160px] bg-black/20 flex items-center justify-center text-xs text-white/40">
                            Back image not provided
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setBlurred((b) => !b)}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/80"
                      >
                        {blurred ? "View ID" : "Hide ID"}
                      </button>
                      <button
                        onClick={approveGuestId}
                        disabled={reviewLoading}
                        className="text-xs px-3 py-1.5 rounded-full bg-white text-black font-semibold disabled:opacity-60"
                      >
                        {reviewLoading ? "Approving..." : "Approve"}
                      </button>
                      <div className="flex items-center gap-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                          placeholder="Reason for rejection"
                        />
                        <button
                          onClick={rejectGuestId}
                          disabled={reviewLoading}
                          className="text-xs px-3 py-1.5 rounded-full border border-red-400/30 text-red-300 disabled:opacity-60"
                        >
                          {reviewLoading ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                      {idRecord.rejection_reason && (
                        <div className="text-[10px] text-white/40">Last rejection: {idRecord.rejection_reason}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BookingActivityTimeline Component is imported but not defined in this file context, assuming it exists */}
              <BookingActivityTimeline bookingId={detail.booking.id} />
            </div>
          )}
        </div>
      </div>

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
                    placeholder="email@example.com"
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
                  placeholder={`Add any notes for the ${labels.customer.toLowerCase()}`}
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

      {showIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-dashboard-surface)] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Request ID</div>
              <button onClick={() => setShowIdModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-white/40 mb-1">ID Type</div>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="any">Any Govt ID</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-white/40 mb-1">Message (optional)</div>
                <textarea
                  value={idNote}
                  onChange={(e) => setIdNote(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 min-h-[80px]"
                  placeholder={`Hi! Please upload a government-issued ID to complete check-in compliance.`}
                />
              </div>
              {idUploadUrl && (
                <div className="text-xs text-white/60 break-all">
                  Upload link: {idUploadUrl}
                </div>
              )}
              {idRequestMessage && (
                <div className="text-xs text-white/60 break-all">
                  Message: {idRequestMessage}
                </div>
              )}
              {idMessage && <div className="text-xs text-white/60">{idMessage}</div>}
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-[10px] text-white/40">Nodebase will store IDs securely.</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowIdModal(false)} className="px-3 py-1.5 text-xs text-white/60 hover:text-white">
                  Close
                </button>
                <button
                  onClick={requestGuestId}
                  disabled={requestingId}
                  className="px-4 py-2 bg-[var(--color-brand-red)] text-white rounded-lg text-xs font-semibold disabled:opacity-60"
                >
                  {requestingId ? "Generating..." : "Generate link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
