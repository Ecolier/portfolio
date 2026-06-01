import { z } from "zod";
import {
  baseLocale,
  isLocale,
  locales,
  localizeHref,
  type Locale as ParaglideLocale,
} from "@/paraglide/runtime.js";

export type Locale = ParaglideLocale;

export const localeSchema = z.custom<Locale>(isLocale);

export const SITE_URL = "https://gruere.dev";

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

/** Return the og:locale value for a given locale. */
export function ogLocale(locale: Locale): string {
  return OG_LOCALE_MAP[locale] ?? "en_US";
}

/** Return og:locale:alternate values (all supported locales except current). */
export function ogLocaleAlternates(locale: Locale): string[] {
  return locales.filter((l) => l !== locale).map((l) => OG_LOCALE_MAP[l]);
}

/** Generate an absolute localized URL for a base path. */
export function localizedUrl(basePath: string, locale: Locale): string {
  return `${SITE_URL}${localizeHref(basePath, { locale })}`;
}

/** Generate the self-referencing canonical URL for a localized page. */
export function canonicalUrl(basePath: string, locale: Locale): string {
  return localizedUrl(basePath, locale);
}

/** Generate <link rel="alternate" hreflang> entries for a given base path. */
export function hreflangLinks(basePath: string) {
  return [
    ...locales.map((locale) => ({
      rel: "alternate",
      hrefLang: locale,
      href: localizedUrl(basePath, locale),
    })),
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: localizedUrl(basePath, baseLocale),
    },
  ];
}
