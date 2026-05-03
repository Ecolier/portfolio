import { useCallback, useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link, useLocation } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
import { themeStore } from "#/lib/themeStore";
import NavContainerRightSvg from "../../assets/nav-container-right.svg?react";
import LogoContainerLeftSvg from "../../assets/logo-container-left.svg?react";
import LogoContainerRightSvg from "../../assets/logo-container-right.svg?react";
import LogoContainerSvg from "../../assets/logo.svg?react";

interface HeaderProps {
  contactEmail: string | null;
  ui: UIStrings;
  locale: Locale;
  theme: "light" | "dark";
}

export default function Header({
  contactEmail,
  ui,
  locale,
  theme,
}: HeaderProps) {
  const resolved = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    () => theme,
  );

  const { pathname } = useLocation();

  const ctaRef = useRef<HTMLAnchorElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const hasSlid = useRef(false);

  const isActive = (href: string) => {
    if (href === localePath("/", locale)) {
      return (
        pathname === href ||
        pathname.startsWith(localePath("/projects", locale))
      );
    }
    return pathname.startsWith(href);
  };

  // Slide the pill indicator to the active link on every navigation.
  useGSAP(() => {
    const pill = pillRef.current;
    const indicator = indicatorRef.current;
    if (!pill || !indicator) return;

    const activeLink = pill.querySelector<HTMLElement>('[data-active="true"]');
    if (!activeLink) {
      gsap.set(indicator, { opacity: 0 });
      return;
    }

    const pillRect = pill.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const x = linkRect.left - pillRect.left;
    const w = linkRect.width;

    // First render or returning from a page with no active link: snap.
    const currentOpacity = gsap.getProperty(indicator, "opacity") as number;
    if (!hasSlid.current || currentOpacity === 0) {
      hasSlid.current = true;
      gsap.set(indicator, { x, width: w, opacity: 1 });
      return;
    }

    // Rubber-band: stretch toward the target then snap to size.
    // Moving right → right edge leads; moving left → left edge leads.
    const prevX = gsap.getProperty(indicator, "x") as number;
    const prevW = gsap.getProperty(indicator, "width") as number;
    const movingRight = x > prevX;

    gsap.killTweensOf(indicator);
    const tl = gsap.timeline();

    if (movingRight) {
      // Stretch right edge to cover destination, then pull left edge in.
      tl.to(indicator, {
        width: x + w - prevX,
        duration: 0.2,
        ease: "power2.out",
      }).to(
        indicator,
        { x, width: w, duration: 0.2, ease: "power2.in" },
        ">-0.06",
      );
    } else {
      // Stretch left edge to cover destination, then pull right edge in.
      tl.to(indicator, {
        x,
        width: prevW + (prevX - x),
        duration: 0.2,
        ease: "power2.out",
      }).to(
        indicator,
        { width: w, duration: 0.2, ease: "power2.in" },
        ">-0.06",
      );
    }
  }, [pathname]);

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
    <header className="fixed w-full top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="page-wrap flex items-center py-3 sm:py-4">
        <div
          className="flex items-center backdrop-blur-md"
          style={{
            maskImage: "url(full-menu.svg)",
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
          }}
        >
          <Link
            to={localePath("/", locale)}
            className="header-logo inline-flex shrink-0 items-center justify-center leading-none"
          >
            <LogoContainerLeftSvg />
            <LogoContainerSvg />
            <LogoContainerRightSvg />
          </Link>
          <nav
            aria-label="Main"
            className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-11.5 bg-(--header-bg)"
          >
            <div
              ref={pillRef}
              className="relative flex shrink-0 items-center gap-0.5 rounded-full px-1 py-1"
            >
              {/* Sliding active indicator */}
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1 left-0 rounded-full"
                style={{ width: 0, opacity: 0 }}
              />
              <Link
                to={localePath("/", locale)}
                data-active={isActive(localePath("/", locale))}
                className={`relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
                  isActive(localePath("/", locale))
                    ? "text-(--sea-ink)"
                    : "text-(--sea-ink-soft) hover:text-(--sea-ink)"
                }`}
              >
                {ui.navProjects}
              </Link>
              <span
                className="relative z-10 text-(--sea-ink-soft) opacity-30"
                aria-hidden="true"
              >
                ·
              </span>
              <Link
                to={localePath("/blog", locale)}
                data-active={isActive(localePath("/blog", locale))}
                className={`relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
                  isActive(localePath("/blog", locale))
                    ? "text-(--sea-ink)"
                    : "text-(--sea-ink-soft) hover:text-(--sea-ink)"
                }`}
              >
                {ui.navBlog}
              </Link>
              <span
                className="relative z-10 text-(--sea-ink-soft) opacity-30"
                aria-hidden="true"
              >
                ·
              </span>
              <Link
                to={localePath("/about", locale)}
                data-active={isActive(localePath("/about", locale))}
                className={`relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
                  isActive(localePath("/about", locale))
                    ? "text-(--sea-ink)"
                    : "text-(--sea-ink-soft) hover:text-(--sea-ink)"
                }`}
              >
                {ui.navAbout}
              </Link>
            </div>
          </nav>
          <NavContainerRightSvg preserveAspectRatio="none" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 ml-auto">
          {contactEmail && (
            <a
              ref={ctaRef}
              href={`mailto:${contactEmail}`}
              className="header-cta hidden items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-medium text-(--sea-ink) no-underline shadow-xs transition hover:bg-(--surface-strong) sm:inline-flex"
              onMouseEnter={() => logoRef.current?.bounce()}
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
