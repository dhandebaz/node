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
    <div className="public-container pb-20 pt-28 sm:pt-32 lg:pt-36">
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-28 lg:block">
          <DocsSidebar />
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="public-panel-soft p-4 lg:hidden">
            <div className="public-eyebrow">Jump to docs section</div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="public-pill whitespace-nowrap text-sm font-semibold text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <section className="public-panel-soft p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="public-inset flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10/70 text-primary">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <div className="public-eyebrow">Documentation</div>
                  <h1 className="public-display mt-2 text-2xl text-foreground">
                    Deployment notes, control surfaces, and implementation detail
                  </h1>
                </div>
              </div>
              <Link href="/company/contact" className="public-button-secondary px-5 py-3 text-sm font-semibold">
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
