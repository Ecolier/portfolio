import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Header from "../../components/Header";
import { getSiteSettings } from "../../functions/getGlobals";
import type { Locale } from "../../functions/getGlobals";
import { detectPreferredLocale } from "../../functions/detectLocale";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  stripLocalePrefix,
} from "../../lib/locale";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: async ({ params, location }) => {
    const { locale } = params;

    if (locale !== undefined) {
      // Reject unknown locale segments
      if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
        throw redirect({ href: stripLocalePrefix(location.pathname) });
      }
      // Redirect /en/… → /… (default locale should never appear in the URL)
      if (locale === DEFAULT_LOCALE) {
        throw redirect({
          href: stripLocalePrefix(location.pathname),
          statusCode: 301,
        });
      }
      return { locale: locale as Locale };
    }

    // No locale prefix — detect from Accept-Language / cookie (server only)
    if (typeof document === "undefined") {
      const { locale: preferred } = await detectPreferredLocale();
      if (preferred !== DEFAULT_LOCALE) {
        throw redirect({
          href: `/${preferred}${location.pathname}`,
          statusCode: 302,
        });
      }
    }

    return { locale: DEFAULT_LOCALE };
  },

  loader: async ({ context }) => {
    const locale = (context as { locale: Locale }).locale;
    return getSiteSettings({ data: locale });
  },

  component: LocaleLayout,
});

function LocaleLayout() {
  const siteSettings = Route.useLoaderData();
  const { locale } = Route.useRouteContext() as { locale: Locale };
  const { pathname } = useLocation();

  // Keep <html lang> in sync on every navigation
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <Header
        contactEmail={siteSettings.contactEmail}
        githubUrl={siteSettings.githubUrl}
        ui={siteSettings.ui}
        locale={locale}
        pathname={pathname}
      />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </>
  );
}
