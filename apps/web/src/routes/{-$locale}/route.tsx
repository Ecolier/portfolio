import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Header from "@/components/Header";
import { getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import { detectPreferredLocale } from "@/functions/detectLocale";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  stripLocalePrefix,
} from "@/lib/locale";
import { useLangSwitch } from "@/hooks/useLangSwitch";

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
    const locale = context.locale;
    return getSiteSettings({ data: locale });
  },

  component: LocaleLayout,
});

function LocaleLayout() {
  const siteSettings = Route.useLoaderData();
  const { locale, initialTheme } = Route.useRouteContext();
  const { pathname } = useLocation();

  // Keep <html lang> in sync on every navigation
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const { switchHref, handleLangSwitch } = useLangSwitch(locale, pathname);

  return (
    <>
      <Header
        contactEmail={siteSettings.contactEmail}
        githubUrl={siteSettings.githubUrl}
        ui={siteSettings.ui}
        locale={locale}
        pathname={pathname}
        initialTheme={initialTheme}
      />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <footer className="site-footer py-6 text-center text-xs text-(--sea-ink-soft) backdrop-blur-sm">
        <div className="page-wrap flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span>©{new Date().getFullYear()} Evan Gruère & Duck</span>
          <div className="flex items-center gap-3">
            {/* Language switcher — mobile only (desktop version is in the header) */}
            <a
              href={switchHref}
              onClick={handleLangSwitch}
              className="rounded-xl px-2 py-1.5 text-xs font-semibold uppercase no-underline transition hover:text-(--sea-ink) sm:hidden"
            >
              {locale === "en" ? "FR" : "EN"}
            </a>
            {siteSettings.contactEmail && (
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="transition hover:text-(--sea-ink)"
              >
                {siteSettings.contactEmail}
              </a>
            )}
            {siteSettings.githubUrl && (
              <a
                href={siteSettings.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-(--sea-ink)"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
