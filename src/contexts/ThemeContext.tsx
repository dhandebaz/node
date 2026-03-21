"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  prefersSystem: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "nb:theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window === "undefined") return "light";
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") return stored;
      // fallback to system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    } catch {
      return "light";
    }
  });

  const prefersSystem = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)"));
  }, []);

  useEffect(() => {
    try {
      // persist selection
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }

    // toggle root class for CSS theming
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    // Listen to system preference changes so "prefers" flows behave well.
    if (!prefersSystem) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Only follow system when user has not explicitly set a value.
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") return; // user override
      } catch {
        // ignore
      }

      if (mq.matches) {
        setThemeState("dark");
      } else {
        setThemeState("light");
      }
    };

    // Older browsers use addListener
    if ("addEventListener" in mq) {
      mq.addEventListener("change", handler as EventListener);
    } else {
      // @ts-ignore fallback
      mq.addListener(handler as any);
    }

    return () => {
      if ("removeEventListener" in mq) {
        mq.removeEventListener("change", handler as EventListener);
      } else {
        // @ts-ignore fallback
        mq.removeListener(handler as any);
      }
    };
  }, [prefersSystem]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, prefersSystem: !!prefersSystem }),
    [theme, prefersSystem],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
