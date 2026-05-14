import { useLocation } from "@tanstack/react-router";
import type { UIStrings } from "#/types/globals";
import type { Locale } from "@/lib/locale";
import Nav from "./Nav";
import NavLink, { type NavLinkProps } from "./Nav/Link";
import ThemeSwitch from "./ThemeSwitch";

interface HeaderProps {
  contactEmail: string | null;
  ui: UIStrings;
  locale: Locale;
  initialTheme: "light" | "dark";
  navLinks: NavLinkProps[];
}

export default function Header({
  contactEmail,
  ui,
  initialTheme,
  navLinks,
}: HeaderProps) {
  const { pathname } = useLocation();

  const isActive = ({ to }: NavLinkProps) => {
    return to !== undefined && pathname.startsWith(to);
  };

  return (
    <header className="sticky z-50 inset-0 pt-[env(safe-area-inset-top)]">
      <div className="page-wrap flex items-center py-2 relative">
        <div className="flex-1 flex">
          <Nav
            links={navLinks}
            renderLink={(link) => (
              <div className="px-4 py-3">
                <NavLink {...link} active={isActive(link)} />
              </div>
            )}
            renderAccessory={() => (
              <div className="px-4 py-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="px-3 py-1.5 text-sm font-medium"
                >
                  {ui.ctaContact}
                </a>
              </div>
            )}
          />
        </div>
        <ThemeSwitch initialTheme={initialTheme} />
      </div>
    </header>
  );
}
