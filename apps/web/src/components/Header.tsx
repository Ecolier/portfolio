import { useCallback, useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
import { useLangSwitch } from "@/hooks/useLangSwitch";
import HeaderDuck, { type HeaderDuckHandle } from "./HeaderDuck";

function getSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
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
  initialTheme: "light" | "dark";
}

export default function Header({
  contactEmail,
  githubUrl,
  ui,
  locale,
  pathname,
  initialTheme,
}: HeaderProps) {
  const resolved = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialTheme,
  );

  const duckRef = useRef<HeaderDuckHandle>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const duck = duckRef.current;
    const cta = ctaRef.current;

    // Hide both before the first paint regardless of route.
    duck?.hide();
    if (cta) gsap.set(cta, { opacity: 0 });

    const observer = new MutationObserver(() => {
      const heroVisible =
        document.documentElement.hasAttribute("data-hero-visible");
      if (heroVisible) {
        duck?.exit();
        if (cta)
          gsap.to(cta, {
            opacity: 0,
            duration: 0.08,
            ease: "power2.in",
            overwrite: true,
          });
      } else {
        duck?.enter();
        if (cta)
          gsap.to(cta, {
            opacity: 1,
            duration: 0.1,
            ease: "power2.out",
            delay: 0.2,
            overwrite: true,
          });
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-visible"],
    });

    // On non-hero pages (or hero scrolled past on load), animate straight in.
    if (!document.documentElement.hasAttribute("data-hero-visible")) {
      duck?.enter();
      if (cta)
        gsap.to(cta, {
          opacity: 1,
          duration: 0.1,
          ease: "power2.out",
          delay: 0.2,
        });
    }

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark";
    const apply = () => {
      // Snap the hero canvas to the new palette before the view-transition
      // "new" snapshot is captured — prevents the canvas from lerping mid-fade.
      document.dispatchEvent(
        new CustomEvent("hero-canvas-theme-snap", { detail: { theme: next } }),
      );
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      localStorage.setItem("theme", next);
      document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
      const metaEl =
        document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
        Object.assign(document.createElement("meta"), { name: "theme-color" });
      metaEl.content = next === "dark" ? "#0b1118" : "#e8edf3";
      if (!metaEl.parentNode) document.head.appendChild(metaEl);
    };
    if ("startViewTransition" in document) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [resolved]);

  const { switchHref, handleLangSwitch } = useLangSwitch(locale, pathname);

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link
          to={localePath("/", locale)}
          className="header-logo inline-flex shrink-0 items-center justify-center leading-none"
        >
          <HeaderDuck ref={duckRef} />
        </Link>

        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          {contactEmail && (
            <a
              ref={ctaRef}
              href={`mailto:${contactEmail}`}
              className="header-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(30,50,72,0.08)] transition-all duration-300 sm:px-4 sm:py-2"
              onMouseEnter={() => duckRef.current?.bounce()}
            >
              {ui.ctaContact}
            </a>
          )}
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <Link
            to={localePath("/about", locale)}
            className="rounded-xl px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
          >
            {ui.navAbout}
          </Link>
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
