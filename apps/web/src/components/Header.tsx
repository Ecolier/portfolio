import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";
import { animateThemeTransition } from "../lib/themeTransition";
import type { UIStrings, Locale } from "../functions/getGlobals";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localePath,
  stripLocalePrefix,
} from "../lib/locale";
import FluidLink from "./FluidLink";

function getSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

interface HeaderProps {
  contactEmail: string | null;
  githubUrl: string | null;
  ui: UIStrings;
  locale: Locale;
  pathname: string;
}

export default function Header({
  contactEmail,
  githubUrl,
  ui,
  locale,
  pathname,
}: HeaderProps) {
  const resolved = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const router = useRouter();

  const toggleTheme = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    localStorage.setItem("theme", next);
    animateThemeTransition(next);
  }, [resolved]);

  // Build the language switcher href by flipping the locale prefix
  const targetLocale: Locale = locale === DEFAULT_LOCALE ? "fr" : "en";
  const basePath = stripLocalePrefix(pathname);
  const switchHref = localePath(basePath, targetLocale);

  function handleLangSwitch(e: React.MouseEvent) {
    e.preventDefault();
    document.cookie = `${LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    router.navigate({ href: switchHref, resetScroll: false });
  }

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(30,50,72,0.08)] sm:px-4 sm:py-2"
            >
              {ui.ctaContact}
            </a>
          )}
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <FluidLink
            to={localePath("/about", locale)}
            className="rounded-xl px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
          >
            {ui.navAbout}
          </FluidLink>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
            aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
          >
            {resolved === "dark" ? (
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink) sm:block"
            >
              <span className="sr-only">GitHub</span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
          )}
        </div>

        <a
          href={switchHref}
          onClick={handleLangSwitch}
          className="ml-auto rounded-xl px-2 py-1.5 text-xs font-semibold uppercase text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
        >
          {locale === "en" ? "FR" : "EN"}
        </a>
      </nav>
    </header>
  );
}
