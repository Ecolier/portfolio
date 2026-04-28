import { useCallback, useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link, useLocation } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
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
  ui: UIStrings;
  locale: Locale;
  initialTheme: "light" | "dark";
}

export default function Header({
  contactEmail,
  ui,
  locale,
  initialTheme,
}: HeaderProps) {
  const resolved = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialTheme,
  );

  const { pathname } = useLocation();

  const duckRef = useRef<HeaderDuckHandle>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Active nav link helper
  const isActive = (href: string) =>
    href === localePath("/", locale)
      ? pathname === href
      : pathname.startsWith(href);

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

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="page-wrap grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 sm:py-4">
        {/* Left: duck logo */}
        <Link
          to={localePath("/", locale)}
          className="header-logo inline-flex shrink-0 items-center justify-center leading-none"
        >
          <HeaderDuck ref={duckRef} />
        </Link>

        {/* Center: pill nav */}
        <nav aria-label="Main" className="flex items-center justify-center">
          <div className="flex items-center gap-0.5 rounded-full border border-(--chip-line) bg-(--chip-bg) px-1 py-1 shadow-xs">
            <Link
              to={localePath("/", locale)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition ${
                isActive(localePath("/", locale))
                  ? "bg-(--surface-strong) text-(--sea-ink)"
                  : "text-(--sea-ink-soft) hover:bg-(--surface) hover:text-(--sea-ink)"
              }`}
            >
              {ui.navProjects}
            </Link>
            <span
              className="text-(--sea-ink-soft) opacity-30"
              aria-hidden="true"
            >
              ·
            </span>
            <Link
              to={localePath("/about", locale)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition ${
                isActive(localePath("/about", locale))
                  ? "bg-(--surface-strong) text-(--sea-ink)"
                  : "text-(--sea-ink-soft) hover:bg-(--surface) hover:text-(--sea-ink)"
              }`}
            >
              {ui.navAbout}
            </Link>
          </div>
        </nav>

        {/* Right: CTA + theme toggle */}
        <div className="flex items-center gap-1.5">
          {contactEmail && (
            <a
              ref={ctaRef}
              href={`mailto:${contactEmail}`}
              className="header-cta hidden items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-medium text-(--sea-ink) no-underline shadow-xs transition hover:bg-(--surface-strong) sm:inline-flex"
              onMouseEnter={() => duckRef.current?.bounce()}
            >
              {ui.ctaContact}
            </a>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-(--sea-ink-soft) transition hover:bg-(--surface) hover:text-(--sea-ink)"
            aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
          >
            {resolved === "dark" ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
