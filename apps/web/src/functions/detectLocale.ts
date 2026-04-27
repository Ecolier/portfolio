import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";
import {
  SUPPORTED_LOCALES,
  LOCALE_COOKIE,
  parseAcceptLanguage,
  type Locale,
} from "@/lib/locale";

/**
 * Server-side locale detection.
 * - If a `locale` cookie exists, returns its value (returning visitor).
 * - Otherwise parses `Accept-Language`, persists the choice as a cookie,
 *   and flags this as a new visitor so the caller can redirect.
 */
export const detectPreferredLocale = createServerFn().handler(async () => {
  const cookie = getCookie(LOCALE_COOKIE);
  if (cookie && SUPPORTED_LOCALES.includes(cookie as Locale)) {
    return { locale: cookie as Locale, isNewVisitor: false };
  }

  const acceptLang = getRequestHeader("accept-language") ?? "";
  const preferred = parseAcceptLanguage(acceptLang);

  setCookie(LOCALE_COOKIE, preferred, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
  });

  return { locale: preferred, isNewVisitor: true };
});
