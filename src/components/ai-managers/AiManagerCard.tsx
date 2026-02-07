"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function AiManagerCard(props: {
  name: string;
  audience?: string;
  responsibility?: string;
  href: string;
  ctaLabel: string;
  price?: number | null;
  disabled?: boolean;
}) {
  const { name, audience, responsibility, href, ctaLabel, price, disabled } = props;

  return (
    <div className="p-8 rounded-2xl border border-brand-bone/10 bg-brand-bone/5 hover:bg-brand-bone/10 transition-colors flex flex-col h-full">
      {audience && (
        <div className="text-xs font-mono uppercase tracking-widest text-brand-bone/60 mb-3">
          {audience}
        </div>
      )}
      <h3 className="text-2xl font-bold uppercase tracking-tight mb-3 text-brand-bone">{name}</h3>
      {responsibility && <p className="text-brand-bone/60 mb-6 flex-grow">{responsibility}</p>}
      {price !== undefined && (
        <p className="text-brand-bone/80 mb-6">
          {price === null ? "Pricing unavailable" : `Starting at ₹${formatPrice(price)} / month`}
        </p>
      )}
      {disabled ? (
        <div className="w-full py-3 border border-brand-bone/20 text-brand-bone/40 rounded-lg font-bold uppercase tracking-wide text-center">
          Unavailable
        </div>
      ) : (
        <Link
          href={href}
          className={cn(
            "w-full py-3 border border-brand-bone/30 text-brand-bone rounded-lg font-bold uppercase tracking-wide hover:bg-brand-bone/10 transition-all text-center flex items-center justify-center gap-2"
          )}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
