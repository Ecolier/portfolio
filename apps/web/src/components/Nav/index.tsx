import { Fragment } from "react";
import NavLink, { type NavLinkProps } from "./Link";

export interface NavProps {
  links: NavLinkProps[];
  renderLink?: (link: NavLinkProps) => React.ReactNode;
}

export default function Nav({ links, renderLink }: NavProps) {
  return (
    <nav
      className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mx-4"
      aria-label="Main"
    >
      {links.map((link, index) => (
        <Fragment key={link.to || link.href}>
          {renderLink ? renderLink(link) : <NavLink {...link} />}
          {index < links.length - 1 && (
            <span className="relative z-10 text-nav-link" aria-hidden="true">
              ·
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
