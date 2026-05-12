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
      className={`relative z-10 rounded-full px-4 py-3 text-sm font-medium no-underline ${
        active
          ? "text-neutral-400 dark:text-neutral-50"
          : "text-neutral-400 dark:text-neutral-200"
      }`}
    >
      {label}
    </Link>
  ) : (
    <a href={href}>{label}</a>
  );
}
