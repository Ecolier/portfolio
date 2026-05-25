import { Link, Outlet, getRouteApi, useLocation } from "@tanstack/react-router";
import { Fragment, useEffect } from "react";
import { localizeHref } from "@/paraglide/runtime.js";
import { m } from "@/paraglide/messages.js";
import { useLangSwitch } from "@/hooks/useLangSwitch";
import ThemeSwitch from "#/components/ThemeSwitch";
import Nav, { type NavLink } from "#/components/Nav";
import { isActivePath } from "./navPaths";

const rootRouteApi = getRouteApi("__root__");

export default function RootLayout() {
  const siteSettings = rootRouteApi.useLoaderData();
  const { locale, initialTheme } = rootRouteApi.useRouteContext();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const { targetLocale, switchHref, handleLangSwitch } = useLangSwitch(
    locale,
    pathname,
  );

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
