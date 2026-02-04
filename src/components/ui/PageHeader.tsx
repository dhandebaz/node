import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  tag?: string;
  className?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}

export function PageHeader({ title, description, tag, className, align = "center", children }: PageHeaderProps) {
  return (
    <section className={cn("pt-32 pb-16 relative overflow-hidden border-b border-white/5", className)}>
      {children}
      <div className={cn("container mx-auto px-6 relative z-10", align === "center" ? "text-center" : "text-left")}>
        {tag && (
          <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark border border-white/10 text-white/70 text-sm font-medium mb-6", align === "center" && "mx-auto")}>
            {tag}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">{title}</h1>
        <p className="text-lg text-white/60 max-w-2xl leading-relaxed mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
