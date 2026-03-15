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
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={`${metric.label}-${metric.value}`} className="public-inset p-4">
            <div className="public-eyebrow">{metric.label}</div>
            <div className="mt-2 text-lg font-semibold text-[var(--public-ink)]">
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
      <section className={cn("public-panel p-6 sm:p-8 lg:p-10", compact && "p-6 sm:p-8")}>
        <div className="relative z-10 max-w-4xl">
          <div className="public-pill public-eyebrow">{eyebrow}</div>
          <h1
            className={cn(
              "public-display public-text-balance mt-6 text-4xl leading-[0.95] text-[var(--public-ink)] sm:text-5xl lg:text-6xl",
              compact && "text-3xl sm:text-4xl lg:text-5xl",
            )}
          >
            {title}
          </h1>
          <p className="public-text-balance mt-5 max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
            {summary}
          </p>
        </div>
      </section>
    </Reveal>
  );
}

function IconTile({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) {
    return <div className="h-11 w-11 rounded-2xl bg-[var(--public-accent-soft)]/70" />;
  }

  return (
    <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)]/75 text-[var(--public-accent-strong)]">
      <Icon className="h-5 w-5" />
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
    <div className="public-panel-soft group h-full p-5 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <IconTile icon={item.icon} />
        {item.stat ? (
          <div className="public-pill text-xs font-semibold text-[var(--public-muted)]">
            {item.stat}
          </div>
        ) : null}
      </div>
      {item.eyebrow ? (
        <div className="public-eyebrow mt-5">{item.eyebrow}</div>
      ) : null}
      <h3 className="mt-2 text-xl font-semibold text-[var(--public-ink)]">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--public-muted)] sm:text-[0.96rem]">
        {item.description}
      </p>
      {item.href ? (
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-accent-strong)]">
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
      <section className="public-panel-soft p-6 sm:p-8">
        <div className="space-y-5">
          <div>
            <h2 className="public-display text-2xl text-[var(--public-ink)] sm:text-3xl">
              {section.title}
            </h2>
            {section.intro ? (
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--public-muted)]">
                {section.intro}
              </p>
            ) : null}
          </div>

          {section.paragraphs?.length ? (
            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[var(--public-muted)]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {section.bullets?.length ? (
            <ul className="grid gap-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="public-inset flex gap-3 px-4 py-3 text-sm leading-6 text-[var(--public-muted)]">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--public-accent)]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.cards?.length ? (
            <div className={cn("grid gap-4", columns)}>
              {section.cards.map((item) => (
                <LinkCard key={`${item.title}-${item.description}`} item={item} compact />
              ))}
            </div>
          ) : null}

          {section.code ? (
            <div className="public-inset overflow-hidden">
              <div className="border-b public-border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--public-muted)]">
                {section.code.label}
              </div>
              <pre className="public-mono overflow-x-auto p-4 text-sm leading-6 text-[var(--public-ink)]">
                {section.code.value}
              </pre>
            </div>
          ) : null}

          {section.note ? (
            <div className="rounded-2xl border border-[var(--public-line)] bg-[var(--public-accent-soft)]/55 px-4 py-3 text-sm leading-6 text-[var(--public-ink)]">
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
      <section className="public-panel public-shimmer p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="public-display text-2xl text-[var(--public-ink)] sm:text-3xl">
              {cta.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--public-muted)]">
              {cta.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={cta.primary.href} className="public-button px-6 py-3 text-sm font-semibold">
              {cta.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {cta.secondary ? (
              <Link
                href={cta.secondary.href}
                className="public-button-secondary px-6 py-3 text-sm font-semibold"
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
