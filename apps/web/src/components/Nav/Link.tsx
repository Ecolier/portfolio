import { Link } from "@tanstack/react-router";

export interface NavLinkProps {
  to: string;
  label: string;
  active?: boolean;
}

export default function NavLink({ to, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium ${
        active
          ? "text-neutral-400 dark:text-neutral-50"
          : "text-neutral-400 dark:text-neutral-200"
      }`}
    >
      {label}
    </Link>
  );
}
