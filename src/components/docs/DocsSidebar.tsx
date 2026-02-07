"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, 
  Code2, 
  Server, 
  Cloud, 
  Cpu, 
  Terminal, 
  Shield, 
  Rocket, 
  Layout,
  Database,
  Globe,
  Brain
} from "lucide-react";

export function DocsSidebar() {
  const pathname = usePathname();

  const links = [
    {
      title: "Getting Started",
      items: [
        { name: "Introduction", href: "/docs/getting-started", icon: Rocket },
        { name: "Quickstart", href: "/docs/getting-started/quickstart", icon: Terminal },
      ]
    },
    {
      title: "kaisa AI",
      items: [
        { name: "Overview", href: "/docs/kaisa", icon: Brain },
        { name: "Agents API", href: "/docs/kaisa/agents-api", icon: Code2 },
        { name: "Integrations", href: "/docs/kaisa/integrations", icon: Layout },
      ]
    },
    {
      title: "Nodebase Space",
      items: [
        { name: "Hosting", href: "/docs/space", icon: Cloud },
        { name: "Object Storage", href: "/docs/space/storage", icon: Database },
        { name: "Edge CDN", href: "/docs/space/cdn", icon: Globe },
        { name: "CLI Reference", href: "/docs/space/cli", icon: Terminal },
      ]
    },
    {
      title: "Infrastructure",
      items: [
        { name: "Node Setup", href: "/docs/infrastructure", icon: Server },
        { name: "H100 Clusters", href: "/docs/infrastructure/h100", icon: Cpu },
        { name: "Security", href: "/docs/infrastructure/security", icon: Shield },
      ]
    }
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r border-brand-bone/10 bg-brand-deep-red/50 backdrop-blur-sm h-[calc(100vh-80px)] sticky top-20 overflow-y-auto custom-scrollbar hidden lg:block">
      <div className="p-6">
        <div className="mb-8">
           <div className="flex items-center gap-2 text-brand-bone font-bold text-xl mb-1">
             <Book className="w-5 h-5" />
             Docs
           </div>
           <p className="text-xs text-brand-bone/40">Version 2.0.4</p>
        </div>

        <div className="space-y-8">
          {links.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-brand-bone/40 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-brand-bone/10 text-brand-bone border border-brand-bone/5" 
                            : "text-brand-bone/60 hover:text-brand-bone hover:bg-brand-bone/5"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-brand-bone" : "opacity-70"}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper icon
function BrainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}
