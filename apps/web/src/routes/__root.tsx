import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { Fragment, Suspense, lazy, useEffect } from "react";
import type { Locale } from "@/lib/locale";
import { detectTheme } from "@/functions/detectTheme";
import {
  deLocalizeHref,
  getLocale,
  localizeHref,
} from "@/paraglide/runtime.js";
import { getSiteSettings } from "@/functions/getGlobals";
import { useLangSwitch } from "@/hooks/useLangSwitch";
import ThemeSwitch from "#/components/ThemeSwitch";
import { m } from "@/paraglide/messages.js";

import appCss from "@/styles.css?url";
import ThemeProvider from "#/components/ThemeProvider";
import Nav, { type NavLink } from "#/components/Nav";

export interface RouterContext {
  locale: Locale;
  initialTheme: "light" | "dark";
}

// Conditionally load router devtools in development
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const locale = getLocale() as Locale;
    const initialTheme = await detectTheme();
    return { ...context, locale, initialTheme };
  },
  loader: async ({ context }) => {
    return getSiteSettings({ data: context.locale });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Outfit:wght@400;500;600;700;800&display=optional",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      {
        rel: "icon",
        href: "/favicon-48.png",
        type: "image/png",
        sizes: "48x48",
      },
      {
        rel: "icon",
        href: "/favicon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function normalizePath(path: string) {
  const [pathname = "/"] = path.split(/[?#]/);
  const withoutLocale = deLocalizeHref(pathname);
  const withoutTrailingSlash = withoutLocale.replace(/\/+$/, "");

  return withoutTrailingSlash || "/";
}

function isActivePath(pathname: string, to: string) {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(to);

  if (targetPath === "/") {
    return currentPath === "/" || currentPath.startsWith("/projects/");
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function RootComponent() {
  const siteSettings = Route.useLoaderData();
  const { locale, initialTheme } = Route.useRouteContext();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const { targetLocale, switchHref, handleLangSwitch } = useLangSwitch(
    locale,
    pathname,
  );

  const isActive = ({ to }: NavLink) => isActivePath(pathname, to);

  const navLinks: NavLink[] = [
    { to: localizeHref("/", { locale }), label: m.nav_projects() },
    {
      to: localizeHref("/about", { locale }),
      label: m.nav_about(),
    },
  ];

  return (
    <>
      <header className="flex sticky z-50 inset-0 py-2 w-page mx-auto">
        <Nav
          renderAccessory={
            siteSettings.contactEmail
              ? () => (
                  <div className="bg-accent-solid text-accent-solid-foreground px-4 py-3">
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="type-ui text-nowrap"
                    >
                      {m.cta_contact()}
                    </a>
                  </div>
                )
              : undefined
          }
        >
          {navLinks.map((link, index) => (
            <Fragment key={link.to}>
              <div>
                <Link
                  {...link}
                  className={`type-ui ${isActivePath(pathname, link.to) ? "text-foreground" : "text-subtle-foreground"}`}
                >
                  {link.label}
                </Link>
              </div>
              {index < navLinks.length - 1 && (
                <span
                  className="relative z-10 text-subtle-foreground"
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </Nav>
      </header>
      <div className="pb-16 bg-page-bg flex-1">
        <Outlet />
      </div>
      <footer className="py-6 text-center text-caption text-muted-foreground w-page mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href={switchHref}
            onClick={handleLangSwitch}
            aria-label={
              targetLocale === "fr"
                ? m.action_switch_to_french()
                : m.action_switch_to_english()
            }
            className="type-button px-2 py-1.5 uppercase no-underline"
          >
            {targetLocale.toUpperCase()}
          </a>
          {siteSettings.contactEmail && (
            <a href={`mailto:${siteSettings.contactEmail}`}>
              {siteSettings.contactEmail}
            </a>
          )}
          {siteSettings.githubUrl && (
            <a href={siteSettings.githubUrl} target="_blank" rel="noreferrer">
              {m.label_github()}
            </a>
          )}
        </div>
        <ThemeSwitch initialTheme={initialTheme} />
      </footer>
    </>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const pageClass =
    useMatches({
      select: (matches) =>
        matches
          .map((match) => match.staticData.pageClass)
          .filter(Boolean)
          .join(" "),
    }) || "bg-page-bg";

  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className={`flex flex-col min-h-dvh
        font-sans ${pageClass}`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Suspense fallback={null}>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
