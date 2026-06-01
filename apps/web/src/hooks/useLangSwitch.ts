import type { Locale } from "@/lib/locale";
import {
  baseLocale,
  deLocalizeHref,
  locales,
  localizeHref,
} from "@/paraglide/runtime.js";

function buildLangSwitchHref(href: string, targetLocale: Locale) {
  return localizeHref(deLocalizeHref(href), { locale: targetLocale });
}

export function useLangSwitch(locale: Locale, href: string) {
  const targetLocale = (locales.find((loc) => loc !== locale) ??
    baseLocale) as Locale;
  const switchHref = buildLangSwitchHref(href, targetLocale);

  return { targetLocale, switchHref };
}
