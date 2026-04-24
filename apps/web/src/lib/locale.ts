import { z } from "zod";
import type { Config } from "@portfolio/types";

export type Locale = Config["locale"];

export const localeSchema = z.enum(["en", "fr"] as const satisfies readonly [
  Locale,
  ...Locale[],
]);

export const SUPPORTED_LOCALES = localeSchema.options;
export const DEFAULT_LOCALE = "en" as const satisfies Locale;
export const LOCALE_COOKIE = "locale";
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
  return SUPPORTED_LOCALES.filter((l) => l !== locale).map(
    (l) => OG_LOCALE_MAP[l],
  );
}

/** Prefix a path with the locale segment (no prefix for the default locale). */
export function localePath(path: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** Remove any leading locale segment from a pathname. */
export function stripLocalePrefix(pathname: string): string {
  for (const loc of SUPPORTED_LOCALES) {
    if (loc === DEFAULT_LOCALE) continue;
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}

/** Parse an Accept-Language header into the best-matching supported locale. */
export function parseAcceptLanguage(header: string): Locale {
  const entries = header.split(",").map((entry) => {
    const [lang, qPart] = entry.trim().split(";");
    const q = qPart ? parseFloat(qPart.split("=")[1]) : 1;
    return { lang: lang.trim().split("-")[0].toLowerCase(), q };
  });
  entries.sort((a, b) => b.q - a.q);
  for (const { lang } of entries) {
    if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  }
  return DEFAULT_LOCALE;
}

/** Generate <link rel="alternate" hreflang> entries for a given base path. */
export function hreflangLinks(basePath: string) {
  const en = basePath === "/" ? "/" : basePath;
  const fr = `/fr${basePath}`;
  return [
    { rel: "alternate", hrefLang: "en", href: `${SITE_URL}${en}` },
    { rel: "alternate", hrefLang: "fr", href: `${SITE_URL}${fr}` },
    { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${en}` },
  ];
}
