import { notFound } from "next/navigation";
import { CalendarDays, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { PaymentLinkService } from "@/lib/services/paymentLinkService";
import { GuestCheckoutFlow } from "@/components/public/GuestCheckoutFlow";

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  await searchParams;

  const link = await PaymentLinkService.getLinkDetails(id);

  if (!link) {
    notFound();
  }

  const amountLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(link.amount || 0));

  return (
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="public-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-5">
              <div className="public-pill public-eyebrow">Secure direct booking</div>
              <div>
                <h1 className="public-display text-4xl leading-[0.94] text-foreground sm:text-5xl">
                  Complete payment and check-in for {link.tenants?.name || "your host"}.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  This portal keeps guest details, ID verification, and payment confirmation
                  in one track so the host can finalize your stay without back-and-forth.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-64">
              <div className="public-inset rounded-[1.3rem] px-4 py-4">
                <div className="public-eyebrow">Listing</div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {link.listings?.title || "Direct booking"}
                </div>
              </div>
              <div className="public-inset rounded-[1.3rem] px-4 py-4">
                <div className="public-eyebrow">Amount due</div>
                <div className="mt-2 text-sm font-semibold text-primary">
                  {amountLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10/70 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Guest details first</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The host gets your arrival details and contact info in a structured check-in flow.
            </p>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10/70 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Masked ID verification</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload a document once. Sensitive identifiers are kept bounded for compliance.
            </p>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10/70 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Payment confirmation</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the host payment instructions, then confirm so the stay can be locked in.
            </p>
          </div>
        </section>

        <GuestCheckoutFlow link={link} />

        <section className="public-panel-soft p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(130,185,112,0.14)] text-[var(--public-success)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="public-eyebrow">Trust signal</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This checkout surface is powered by Nodebase and designed for direct-booking
                  workflows that need compliance, payment tracking, and fewer manual handoffs.
                </p>
              </div>
            </div>
            <div className="public-pill text-xs font-semibold text-muted-foreground">
              PCI-aware flow with verified host context
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
