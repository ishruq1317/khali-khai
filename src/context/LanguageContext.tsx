"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: typeof translations.bn;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("khali_khai_locale") as Locale;
      if (saved && (saved === "bn" || saved === "en")) {
        setLocale(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetLocale = (l: Locale) => {
    setLocale(l);
    try {
      localStorage.setItem("khali_khai_locale", l);
    } catch {
      // ignore
    }
  };

  const toggleLocale = () => {
    handleSetLocale(locale === "bn" ? "en" : "bn");
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        toggleLocale,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
