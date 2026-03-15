import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, MessageSquareShare, Phone, ShieldCheck } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ handle: string }>;
}

async function getTenant(handle: string) {
  const admin = await getSupabaseAdmin();
  const { data } = await admin
    .from("tenants")
    .select("name, username, business_type, address, phone, created_at, owner_user_id")
    .eq("username", handle)
    .single();

  return data;
}

function formatBusinessType(value?: string | null) {
  if (!value) return "Operator profile";
  return value.replace(/_/g, " ");
}

function formatMemberSince(value?: string | null) {
  if (!value) return "Recently joined";

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const tenant = await getTenant(handle);

  if (!tenant) {
    return { title: "Profile not found" };
  }

  return {
    title: `${tenant.name} | Nodebase`,
    description: `Public profile for ${tenant.name}.`,
    openGraph: {
      title: tenant.name,
      description: `Public profile for ${tenant.name}.`,
      type: "profile",
      username: handle,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const tenant = await getTenant(handle);

  if (!tenant) {
    notFound();
  }

  const initials = tenant.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="public-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
            <div className="public-inset flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[var(--public-accent)] text-3xl font-bold text-white">
              {initials || "NB"}
            </div>
            <div className="space-y-4">
              <div className="public-pill public-eyebrow">Public business profile</div>
              <div>
                <h1 className="public-display text-4xl text-[var(--public-ink)] sm:text-5xl">
                  {tenant.name}
                </h1>
                <p className="mt-3 text-base capitalize leading-7 text-[var(--public-muted)]">
                  {formatBusinessType(tenant.business_type)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                  @{tenant.username}
                </div>
                <div className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                  Member since {formatMemberSince(tenant.created_at)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Business type</div>
            <div className="mt-2 text-base font-semibold capitalize text-[var(--public-ink)]">
              {formatBusinessType(tenant.business_type)}
            </div>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Location</div>
            <div className="mt-2 text-base font-semibold text-[var(--public-ink)]">
              {tenant.address || "Shared during direct conversation"}
            </div>
          </div>
          <div className="public-panel-soft p-5">
            <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/70 text-[var(--public-accent-strong)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="public-eyebrow mt-4">Surface</div>
            <div className="mt-2 text-base font-semibold text-[var(--public-ink)]">
              Powered by Nodebase public profile
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <section className="public-panel p-6 sm:p-8">
            <div className="relative z-10 space-y-5">
              <div>
                <div className="public-eyebrow">How to reach out</div>
                <h2 className="public-display mt-3 text-3xl text-[var(--public-ink)]">
                  Start with the fastest working lane.
                </h2>
              </div>
              <div className="grid gap-3">
                {tenant.owner_user_id ? (
                  <Link
                    href={`/chat/${tenant.owner_user_id}`}
                    className="public-inset flex items-center justify-between rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-[var(--public-ink)]"
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquareShare className="h-4 w-4 text-[var(--public-accent-strong)]" />
                      Open direct chat
                    </span>
                    <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                      Messaging portal
                    </span>
                  </Link>
                ) : null}

                {tenant.phone ? (
                  <a
                    href={`tel:${tenant.phone}`}
                    className="public-inset flex items-center justify-between rounded-[1.3rem] px-4 py-4 text-sm font-semibold text-[var(--public-ink)]"
                  >
                    <span className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[var(--public-accent-strong)]" />
                      Call {tenant.phone}
                    </span>
                    <span className="public-pill text-xs font-semibold text-[var(--public-muted)]">
                      Phone
                    </span>
                  </a>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-[var(--public-muted)]">
                This profile is meant to give guests and visitors a direct contact surface
                without forcing them into the full product dashboard.
              </p>
            </div>
          </section>

          <section className="public-panel-soft p-6">
            <div className="space-y-4">
              <div className="public-pill public-eyebrow">Visitor note</div>
              <p className="text-sm leading-6 text-[var(--public-muted)]">
                If you are arriving for a stay, use the direct booking or guest ID links
                shared by the business. Those portals handle check-in details, payment,
                and verification securely.
              </p>
              <div className="rounded-[1.4rem] border border-[var(--public-line)] bg-[rgba(255,248,235,0.78)] p-4">
                <div className="text-sm font-semibold text-[var(--public-ink)]">
                  Need a Nodebase-style public surface for your own business?
                </div>
                <Link
                  href="/company/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]"
                >
                  Talk to Nodebase
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
