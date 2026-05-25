import { detectTheme } from "@/functions/detectTheme";
import { getSiteSettings } from "@/functions/getGlobals";
import type { RouterContext } from "@/routes/__root";
import { getLocale } from "@/paraglide/runtime.js";
import type { Locale } from "@/lib/locale";

export async function rootBeforeLoad({ context }: { context: RouterContext }) {
  const locale = getLocale() as Locale;
  const initialTheme = await detectTheme();
  return { ...context, locale, initialTheme };
}

export async function rootLoader({ context }: { context: RouterContext }) {
  return getSiteSettings({ data: context.locale });
}
