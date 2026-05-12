import { useLocation } from "@tanstack/react-router";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";
import Nav from "./Nav";
import NavLink, { type NavLinkProps } from "./Nav/Link";
import ThemeSwitch from "./ThemeSwitch";

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
  const navLinks: NavLinkProps[] = [
    { to: localePath("/projects", locale), label: ui.navProjects },
    { to: localePath("/blog", locale), label: ui.navBlog },
    { to: localePath("/about", locale), label: ui.navAbout },
  ];

  const { pathname } = useLocation();

  const isActive = ({ to }: NavLinkProps) => {
    return to !== undefined && pathname.startsWith(to);
  };

  return (
    <header className="sticky z-50 inset-0 pt-[env(safe-area-inset-top)]">
      <div className="page-wrap flex items-center py-2 relative">
        <Nav
          links={navLinks}
          renderLink={(link) => <NavLink {...link} active={isActive(link)} />}
        />
        <div className="flex shrink-0 items-center gap-1.5 ml-auto">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="header-cta hidden items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-medium text-(--sea-ink) no-underline shadow-xs transition hover:bg-(--surface-strong) sm:inline-flex"
            >
              {ui.ctaContact}
            </a>
          )}
          <ThemeSwitch initialTheme={initialTheme} />
        </div>
      </div>
    </header>
  );
}
