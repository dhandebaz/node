"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type {
  PublicArticlePageData,
  PublicCardItem,
  PublicDirectoryPageData,
  PublicSection,
} from "@/lib/public-content";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const viewport = { once: true, amount: 0.22 };

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Wrapper({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  if (compact) {
    return <div className="space-y-10 pb-10">{children}</div>;
  }

  return (
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="space-y-12">{children}</div>
    </div>
  );
}

function MetricStrip({ metrics }: { metrics?: PublicArticlePageData["metrics"] }) {
  if (!metrics?.length) return null;

  return (
    <Reveal>
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={`${metric.label}-${metric.value}`} className="public-inset p-5 border-l-4 border-l-primary/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">{metric.label}</div>
            <div className="mt-2 text-xl font-bold text-foreground">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function Hero({
  eyebrow,
  title,
  summary,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  compact?: boolean;
}) {
  return (
    <Reveal>
      <section className={cn("public-panel p-8 sm:p-12 lg:p-16", compact && "p-6 sm:p-8")}>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex py-1 px-3 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-black uppercase tracking-[0.2em]">
            {eyebrow}
          </div>
          <h1
            className={cn(
              "font-display mt-6 text-4xl leading-[0.95] text-foreground sm:text-5xl lg:text-7xl uppercase tracking-tighter",
              compact && "text-3xl sm:text-4xl lg:text-5xl",
            )}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground font-sans">
            {summary}
          </p>
        </div>
      </section>
    </Reveal>
  );
}

function IconTile({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) {
    return <div className="h-12 w-12 rounded-2xl bg-primary/5 ring-1 ring-primary/10" />;
  }

  return (
    <div className="public-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/20">
      <Icon className="h-6 w-6" />
    </div>
  );
}

function LinkCard({
  item,
  compact = false,
}: {
  item: PublicCardItem;
  compact?: boolean;
}) {
  const content = (
    <div className="public-panel-soft group h-full p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <IconTile icon={item.icon} />
        {item.stat ? (
          <div className="inline-flex py-1 px-3 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-tight">
            {item.stat}
          </div>
        ) : null}
      </div>
      {item.eyebrow ? (
        <div className="text-[10px] font-black uppercase tracking-widest text-primary mt-6">{item.eyebrow}</div>
      ) : null}
      <h3 className="mt-2 text-xl font-bold text-foreground uppercase tracking-tight">{item.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-sans">
        {item.description}
      </p>
      {item.href ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-tight">
          {item.ctaLabel || "Open page"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      ) : null}
    </div>
  );

  if (!item.href) return content;
  return (
    <Link href={item.href} className={cn("block", compact && "h-full")}>
      {content}
    </Link>
  );
}

function SectionBlock({ section }: { section: PublicSection }) {
  const columns = section.columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <Reveal>
      <section className="public-panel-soft p-8 sm:p-12 border-l-4 border-l-primary/10">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl uppercase tracking-tighter leading-none">
              {section.title}
            </h2>
            {section.intro ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground font-sans">
                {section.intro}
              </p>
            ) : null}
          </div>

          {section.paragraphs?.length ? (
            <div className="space-y-5">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-muted-foreground font-sans">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {section.bullets?.length ? (
            <ul className="grid gap-4">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="public-inset flex gap-4 px-5 py-4 text-sm font-bold text-foreground uppercase tracking-tight border-l-4 border-l-primary/10">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.cards?.length ? (
            <div className={cn("grid gap-6 pt-4", columns)}>
              {section.cards.map((item) => (
                <LinkCard key={`${item.title}-${item.description}`} item={item} compact />
              ))}
            </div>
          ) : null}

          {section.code ? (
            <div className="public-inset overflow-hidden rounded-2xl border border-border mt-4">
              <div className="border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary">
                {section.code.label}
              </div>
              <pre className="public-mono overflow-x-auto p-5 text-sm leading-relaxed text-foreground bg-zinc-950 text-zinc-300">
                {section.code.value}
              </pre>
            </div>
          ) : null}

          {section.note ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 text-sm font-bold text-foreground uppercase tracking-tight leading-relaxed">
              {section.note}
            </div>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}

function CtaPanel({
  cta,
}: {
  cta?: PublicArticlePageData["cta"];
}) {
  if (!cta) return null;

  return (
    <Reveal>
      <section className="public-panel p-8 sm:p-16 border-t-8 border-primary bg-primary/5">
        <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl space-y-4">
            <h2 className="font-display text-4xl text-foreground sm:text-5xl uppercase tracking-tighter leading-[0.9]">
              {cta.title}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-sans">
              {cta.description}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href={cta.primary.href} className="public-button px-10 py-5 text-sm">
              {cta.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {cta.secondary ? (
              <Link
                href={cta.secondary.href}
                className="public-button-secondary px-10 py-5 text-sm"
              >
                {cta.secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export function DirectoryPage({
  page,
  compact = false,
}: {
  page: PublicDirectoryPageData;
  compact?: boolean;
}) {
  return (
    <Wrapper compact={compact}>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        summary={page.summary}
        compact={compact}
      />
      <MetricStrip metrics={page.metrics} />
      <Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {page.cards.map((item, index) => (
            <LinkCard key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      </Reveal>
      {page.sections?.map((section) => (
        <SectionBlock key={section.title} section={section} />
      ))}
      <CtaPanel cta={page.cta} />
    </Wrapper>
  );
}

export function ArticlePage({
  page,
  compact = false,
}: {
  page: PublicArticlePageData;
  compact?: boolean;
}) {
  return (
    <Wrapper compact={compact}>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        summary={page.summary}
        compact={compact}
      />
      <MetricStrip metrics={page.metrics} />
      {page.sections.map((section) => (
        <SectionBlock key={section.title} section={section} />
      ))}
      <CtaPanel cta={page.cta} />
    </Wrapper>
  );
}
