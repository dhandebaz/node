import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { docsNavigation } from "@/lib/public-content";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mobileLinks = docsNavigation.flatMap((section) => section.items);

  return (
    <div className="public-container pb-32 pt-36 sm:pt-48 lg:pt-56">
      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-28 lg:block">
          <DocsSidebar />
        </aside>

        <main className="min-w-0 space-y-8">
          {/* Mobile doc nav */}
          <div className="glass-panel p-4 rounded-2xl lg:hidden">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Jump to docs section
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Docs header */}
          <section className="glass-panel p-6 sm:p-8 rounded-[2rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Documentation
                  </div>
                  <h1 className="font-display mt-2 text-2xl text-white tracking-tighter">
                    Deployment notes, control surfaces, and implementation
                    detail
                  </h1>
                </div>
              </div>
              <Link
                href="/company/contact"
                className="public-button-secondary px-5 py-3 text-sm font-semibold"
              >
                Need deployment help
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <div className="max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
