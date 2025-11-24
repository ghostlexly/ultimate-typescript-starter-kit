import { ReactNode } from "react";
import { headers } from "next/headers";
import { LocaleProviderClient } from "./locale-provider-client";

const supportedLocales = ["fr", "en"];
const defaultLocale = "fr";

/**
 * Detects user locale from Accept-Language header
 */
function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage.split(",").map((lang) => {
    const [code] = lang.trim().split(";");

    return code.split("-")[0].toLowerCase();
  });

  // Find first supported language
  const detectedLocale =
    languages.find((lang) => supportedLocales.includes(lang)) || defaultLocale;

  return detectedLocale;
}

// Server component wrapper that detects locale from Accept-Language header
export async function LocaleProvider({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const localeCode = detectLocale(acceptLanguage);

  return (
    <LocaleProviderClient localeCode={localeCode}>
      {children}
    </LocaleProviderClient>
  );
}
