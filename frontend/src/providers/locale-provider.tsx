"use client";

import { createContext, useContext, ReactNode } from "react";
import { fr, enUS, Locale } from "date-fns/locale";
import { setDefaultOptions } from "date-fns";

type LocaleContextType = {
  locale: Locale;
  localeCode: string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const localeMap = {
  fr,
  en: enUS,
};

type LocaleProviderProps = {
  children: ReactNode;
  localeCode: string;
};

export function LocaleProvider({ children, localeCode }: LocaleProviderProps) {
  const locale =
    localeMap[localeCode as keyof typeof localeMap] || localeMap.fr;

  // Set date-fns default options immediately, before rendering children
  setDefaultOptions({ locale });

  return (
    <LocaleContext.Provider value={{ locale, localeCode }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
