import { useCallback, useSyncExternalStore } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
import { themeStore } from "#/lib/themeStore";
import LogoSvg from "../../assets/logo.svg?react";
import Nav from "./Nav";
import NavLink, { type NavLinkProps } from "./Nav/Link";

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

  const navLinks: NavLinkProps[] = [
    { to: localePath("/projects", locale), label: ui.navProjects },
    { to: localePath("/blog", locale), label: ui.navBlog },
    { to: localePath("/about", locale), label: ui.navAbout },
  ];

  const { pathname } = useLocation();

  const isActive = ({ to }: NavLinkProps) => {
    return to !== undefined && pathname.startsWith(to);
  };

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
    <header className="sticky z-50 inset-0 pt-[env(safe-area-inset-top)]">
      <div className="page-wrap flex items-center py-2 relative">
        <div className="shape before:after:backdrop-saturate-50 before:after:backdrop-blur-xl before:shape-outline before:bg-nav-outline/50 after:shape-decoration after:bg-nav-decoration/75 flex items-center relative backdrop-blur-xl bg-nav/75 backdrop-saturate-50">
          <div className="flex items-stretch">
            <Nav
              links={navLinks}
              renderLink={(link) => (
                <NavLink {...link} active={isActive(link)} />
              )}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 ml-auto">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="header-cta hidden items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-medium text-(--sea-ink) no-underline shadow-xs transition hover:bg-(--surface-strong) sm:inline-flex"
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
