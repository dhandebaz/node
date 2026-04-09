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
  const [theme, setThemeState] = useState<Theme>("light");
  const prefersSystem = false;

  useEffect(() => {
    // toggle root class for CSS theming
    const root = document.documentElement;
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    
    // Cleanup any legacy theme values
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const setTheme = (t: Theme) => {
    // Only light theme allowed in Nodebase Light
    setThemeState("light");
  };

  const toggleTheme = () => {
    // No-op in Nodebase Light
  };

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, prefersSystem }),
    [theme],
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
