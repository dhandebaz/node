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
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl lg:hidden shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Jump to docs section
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Docs header */}
          <section className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-[2rem] shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm shadow-blue-600/5">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Documentation
                  </div>
                  <h1 className="font-display mt-2 text-2xl text-zinc-950 tracking-tighter">
                    Deployment notes, control surfaces, and implementation
                    detail
                  </h1>
                </div>
              </div>
              <Link
                href="/company/contact"
                className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-950 text-white text-sm font-bold rounded-full hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/20"
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
