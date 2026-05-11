import { Link } from "@tanstack/react-router";

interface NavLinkBase {
  active?: boolean;
  label: string;
}

export type NavLinkProps =
  | (NavLinkBase & { to: string; href?: never })
  | (NavLinkBase & { href: string; to?: never });

export default function NavLink({ to, href, active, label }: NavLinkProps) {
  return to ? (
    <Link
      to={to}
      className={`relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
        active
          ? "text-on-surface-nav-hover"
          : "text-on-surface-nav hover:text-(--sea-ink)"
      }`}
    >
      {label}
    </Link>
  ) : (
    <a href={href}>{label}</a>
  );
}
