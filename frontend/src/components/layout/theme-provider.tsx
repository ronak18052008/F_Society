"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

type Theme = "dark" | "light";

const KEY = "fsociety-theme-v2";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Theme {
  return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    emit();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
