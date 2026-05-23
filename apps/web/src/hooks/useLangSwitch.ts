import { useCallback } from "react";
import type { Locale } from "@/lib/locale";
import {
  baseLocale,
  deLocalizeHref,
  locales,
  localizeHref,
  setLocale,
} from "@/paraglide/runtime.js";

export function useLangSwitch(locale: Locale, pathname: string) {
  const targetLocale = (locales.find((loc) => loc !== locale) ??
    baseLocale) as Locale;
  const switchHref = localizeHref(deLocalizeHref(pathname), {
    locale: targetLocale,
  });

  const handleLangSwitch = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      void setLocale(targetLocale);
    },
    [targetLocale],
  );

  return { targetLocale, switchHref, handleLangSwitch };
}
