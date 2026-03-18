"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import en from "@/i18n/en.json";
import id from "@/i18n/id.json";

export type Locale = "en" | "id";

const messages: Record<Locale, Record<string, unknown>> = { en, id };

// Dot-notation lookup: t("nav.home") => messages[locale].nav.home
function resolve(obj: unknown, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("kulinarya-locale");
    if (stored === "en" || stored === "id") return stored;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("kulinarya-locale", newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      let result = resolve(messages[locale], key);
      if (replacements) {
        for (const [placeholder, value] of Object.entries(replacements)) {
          result = result.replace(`{${placeholder}}`, String(value));
        }
      }
      return result;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
