"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";

const languages: { code: Language; name: string; label: string }[] = [
  { code: "en", name: "English", label: "EN" },
  { code: "hi", name: "हिंदी", label: "HI" },
];

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
          "text-white/80 hover:text-white hover:bg-white/10",
          className
        )}
      >
        <Globe className="w-4 h-4" />
        <span>{languages.find(l => l.code === language)?.label}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-32 bg-white/90 backdrop-blur-md border border-black/5 rounded-lg shadow-lg overflow-hidden py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors",
                  language === lang.code ? "text-brand-saffron font-medium" : "text-foreground/80"
                )}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
