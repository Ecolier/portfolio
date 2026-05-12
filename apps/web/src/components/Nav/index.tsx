import { Fragment } from "react";
import NavLink, { type NavLinkProps } from "./Link";

export interface NavProps {
  links: NavLinkProps[];
  renderLink?: (link: NavLinkProps) => React.ReactNode;
}

export default function Nav({ links, renderLink }: NavProps) {
  return (
    <div
      className="flex items-center relative
      nav-shape bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-xl backdrop-saturate-100 
      before:nav-outline before:bg-neutral-0 dark:before:bg-neutral-800/90
      after:nav-edge after:bg-neutral-200 dark:after:bg-neutral-950"
    >
      <div className="flex items-stretch">
        <nav
          className="flex min-w-0 items-center overflow-x-auto 
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mx-4"
          aria-label="Main"
        >
          {links.map((link, index) => (
            <Fragment key={link.to || link.href}>
              {renderLink ? renderLink(link) : <NavLink {...link} />}
              {index < links.length - 1 && (
                <span
                  className="relative z-10 text-neutral-500"
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}
