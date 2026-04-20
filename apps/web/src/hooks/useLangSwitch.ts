import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Locale } from "@/lib/locale";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localePath,
  stripLocalePrefix,
} from "@/lib/locale";

export function useLangSwitch(locale: Locale, pathname: string) {
  const router = useRouter();
  const targetLocale: Locale = locale === DEFAULT_LOCALE ? "fr" : "en";
  const basePath = stripLocalePrefix(pathname);
  const switchHref = localePath(basePath, targetLocale);

  const handleLangSwitch = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.cookie = `${LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
      router.navigate({ href: switchHref, resetScroll: false });
    },
    [router, switchHref, targetLocale],
  );

  return { targetLocale, switchHref, handleLangSwitch };
}
