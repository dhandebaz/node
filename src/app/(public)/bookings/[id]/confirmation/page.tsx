import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  await searchParams;

  const supabaseAdmin = await getSupabaseAdmin();
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, listings(name), tenants(business_type, is_branding_enabled)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const isConfirmed = booking.status === "confirmed";
  const isPending = booking.status === "payment_pending";
  const headline = isConfirmed ? "Booking confirmed" : isPending ? "Payment recorded" : "Booking received";
  const summary = isConfirmed
    ? `Your stay at ${booking.listings?.name || "the property"} is confirmed.`
    : isPending
      ? `Payment has been recorded for ${booking.listings?.name || "the property"}. Final confirmation should reach you shortly.`
      : `We have received your booking for ${booking.listings?.name || "the property"}. Watch for the host's next update.`;

  let brandingText = "Powered by Nodebase AI";
  if (booking.tenants?.is_branding_enabled) {
    switch (booking.tenants.business_type) {
      case "kirana_store":
      case "thrift_store":
        brandingText = "This business runs on Nodebase";
        break;
      case "doctor_clinic":
        brandingText = "Automated with Nodebase";
        break;
      default:
        brandingText = "Powered by Nodebase AI";
        break;
    }
  }

  return (
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="public-panel px-6 py-8 text-center sm:px-8 sm:py-10">
          <div className="relative z-10 space-y-5">
            <div className="public-inset mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]">
              {isConfirmed ? <CheckCircle2 className="h-9 w-9" /> : <Clock3 className="h-9 w-9" />}
            </div>
            <div className="space-y-3">
              <div className="public-pill public-eyebrow">
                {isConfirmed ? "Confirmed stay" : isPending ? "Awaiting final confirmation" : "Booking update"}
              </div>
              <h1 className="public-display text-4xl text-[var(--public-ink)] sm:text-5xl">
                {headline}
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--public-muted)]">
                {summary}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Amount</div>
            <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
              {formatCurrency(booking.amount)}
            </div>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Check-in</div>
            <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
              {formatDate(booking.start_date)}
            </div>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Check-out</div>
            <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
              {formatDate(booking.end_date)}
            </div>
          </div>
        </section>

        <section className="public-panel-soft p-6 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <div className="public-eyebrow">What happens next</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--public-muted)]">
                <li className="public-inset rounded-[1.2rem] px-4 py-3">
                  Keep this page for your records until you receive the host confirmation message.
                </li>
                <li className="public-inset rounded-[1.2rem] px-4 py-3">
                  If the host requested additional verification, complete that before arrival.
                </li>
                <li className="public-inset rounded-[1.2rem] px-4 py-3">
                  Use the contact method shared by the host if arrival details change.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/" className="public-button px-6 py-3 text-sm font-semibold">
                Return home
              </Link>
              <Link href="/trust" className="public-button-secondary px-6 py-3 text-sm font-semibold">
                Review trust center
              </Link>
            </div>
          </div>
        </section>

        {booking.tenants?.is_branding_enabled ? (
          <div className="text-center text-xs uppercase tracking-[0.22em] text-[var(--public-muted)]">
            {brandingText}
          </div>
        ) : null}
      </div>
    </div>
  );
}
