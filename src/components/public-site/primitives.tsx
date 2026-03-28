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
    <div className="public-container pb-32 pt-36 sm:pt-48 lg:pt-56">
      <div className="space-y-16">{children}</div>
    </div>
  );
}

function MetricStrip({
  metrics,
}: {
  metrics?: PublicArticlePageData["metrics"];
}) {
  if (!metrics?.length) return null;

  return (
    <Reveal>
      <div className="grid gap-6 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={`${metric.label}-${metric.value}`}
            className="glass-panel p-6 rounded-2xl border-l-2 border-l-blue-500 group hover:bg-white/5 transition-colors"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">
              {metric.label}
            </div>
            <div className="mt-3 text-xl font-bold text-white">
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
      <section
        className={cn(
          "glass-panel p-8 sm:p-12 lg:p-16 rounded-[2.5rem] relative overflow-hidden",
          compact && "p-6 sm:p-8"
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex py-1.5 px-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-sans text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            {eyebrow}
          </div>
          <h1
            className={cn(
              "font-display mt-6 text-4xl leading-[1.1] text-white sm:text-5xl lg:text-7xl tracking-tighter",
              compact && "text-3xl sm:text-4xl lg:text-5xl"
            )}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400 font-sans">
            {summary}
          </p>
        </div>
      </section>
    </Reveal>
  );
}

function IconTile({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) {
    return (
      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10" />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
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
    <div className="glass-panel group h-full p-7 rounded-[2rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] hover:border-blue-500/20">
      <div className="flex items-start justify-between gap-4">
        <IconTile icon={item.icon} />
        {item.stat ? (
          <div className="inline-flex py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
            {item.stat}
          </div>
        ) : null}
      </div>
      {item.eyebrow ? (
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-6">
          {item.eyebrow}
        </div>
      ) : null}
      <h3 className="mt-2 text-xl font-bold text-white tracking-tight">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400 font-sans">
        {item.description}
      </p>
      {item.href ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
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
      <section className="glass-panel p-8 sm:p-12 rounded-[2rem] border-l-2 border-l-blue-500/30">
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl tracking-tighter leading-tight">
              {section.title}
            </h2>
            {section.intro ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 font-sans">
                {section.intro}
              </p>
            ) : null}
          </div>

          {section.paragraphs?.length ? (
            <div className="space-y-5">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-relaxed text-zinc-400 font-sans"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {section.bullets?.length ? (
            <ul className="grid gap-4">
              {section.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-4 px-5 py-4 text-sm font-medium text-zinc-300 glass-panel rounded-xl border-l-2 border-l-white/10 hover:bg-white/5 transition-colors"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.cards?.length ? (
            <div className={cn("grid gap-6 pt-4", columns)}>
              {section.cards.map((item) => (
                <LinkCard
                  key={`${item.title}-${item.description}`}
                  item={item}
                  compact
                />
              ))}
            </div>
          ) : null}

          {section.code ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 mt-4">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {section.code.label}
              </div>
              <pre className="public-mono overflow-x-auto p-5 text-sm leading-relaxed text-zinc-300 bg-black/50">
                {section.code.value}
              </pre>
            </div>
          ) : null}

          {section.note ? (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-6 py-4 text-sm font-semibold text-zinc-300 leading-relaxed">
              {section.note}
            </div>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}

function CtaPanel({ cta }: { cta?: PublicArticlePageData["cta"] }) {
  if (!cta) return null;

  return (
    <Reveal>
      <section className="glass-panel-glow p-12 sm:p-20 rounded-[3rem] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="font-display text-4xl text-white sm:text-5xl tracking-tighter leading-tight max-w-3xl">
            {cta.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400 font-sans max-w-2xl">
            {cta.description}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
        <div className="grid gap-6 md:grid-cols-2">
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
