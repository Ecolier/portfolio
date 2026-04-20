import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { animateThemeTransition } from "@/lib/themeTransition";
import type { UIStrings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
import { useLangSwitch } from "@/hooks/useLangSwitch";
import FluidLink from "./FluidLink";
import HeaderDuck, { type HeaderDuckHandle } from "./HeaderDuck";

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

  const duckRef = useRef<HeaderDuckHandle>(null);

  // Fly the header duck in/out based on hero visibility
  const settled = useRef(false);
  useEffect(() => {
    const duck = duckRef.current;
    if (!duck) return;

    const observer = new MutationObserver(() => {
      const visible =
        document.documentElement.hasAttribute("data-hero-visible");

      if (!settled.current) {
        // First callback after mount — snap without animating
        settled.current = true;
        if (visible) duck.hide();
        else duck.show();
        // Enable CSS transitions for subsequent changes
        requestAnimationFrame(() => {
          document.documentElement.classList.add("header-ready");
        });
        return;
      }

      if (visible) {
        duck.exit();
      } else {
        duck.enter();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-visible"],
    });

    // If the attribute is already settled before the first mutation, snap now
    const alreadyVisible =
      document.documentElement.hasAttribute("data-hero-visible");
    if (alreadyVisible) {
      settled.current = true;
      duck.hide();
      requestAnimationFrame(() => {
        document.documentElement.classList.add("header-ready");
      });
    }

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    localStorage.setItem("theme", next);
    document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
    const old = document.querySelector('meta[name="theme-color"]');
    if (old) old.remove();
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = next === "dark" ? "#0b1118" : "#edf1f6";
    document.head.appendChild(meta);
    animateThemeTransition(next);
  }, [resolved]);

  const { switchHref, handleLangSwitch } = useLangSwitch(locale, pathname);

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <FluidLink
          to={localePath("/", locale)}
          className="header-logo shrink-0"
        >
          <HeaderDuck ref={duckRef} />
        </FluidLink>

        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="header-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(30,50,72,0.08)] transition-all duration-300 sm:px-4 sm:py-2"
              onMouseEnter={() => duckRef.current?.bounce()}
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
              <Sun size={22} aria-hidden="true" />
            ) : (
              <Moon size={22} aria-hidden="true" />
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
          className="ml-auto hidden rounded-xl px-2 py-1.5 text-xs font-semibold uppercase text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink) sm:block"
        >
          {locale === "en" ? "FR" : "EN"}
        </a>
      </nav>
    </header>
  );
}
