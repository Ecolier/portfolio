import { Fragment, type ReactNode } from "react";
import NavLink, { type NavLinkProps } from "./Link";

export interface NavProps {
  links: NavLinkProps[];
  renderLink?: (link: NavLinkProps) => ReactNode;
  renderAccessory?: () => ReactNode;
}

export default function Nav({ links, renderLink, renderAccessory }: NavProps) {
  return (
    <>
      <div
        className="flex items-center relative
          nav-shape bg-linear-to-tl 
          from-neutral-100/75 to-neutral-50/90
          dark:from-neutral-900/90 dark:to-neutral-700/75
          backdrop-blur-md backdrop-saturate-50"
      >
        <div
          className="absolute inset-0 nav-decoration bg-linear-to-tl from-accent-500/75 to-accent-300/50 dark:from-accent-200/75 dark:to-accent-50/50 backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 nav-highlight bg-neutral-50/90 dark:bg-neutral-50/30 backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 nav-shadow bg-neutral-950/30 dark:bg-neutral-950/90 backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div className="items-stretch">
          <nav
            className="flex min-w-0 overflow-x-auto 
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Main"
          >
            <div className="flex items-center mx-4">
              {links.map((link, index) => (
                <Fragment key={link.to}>
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
            </div>
            <div className="cta-shape bg-linear-to-tl from-accent-500/75 to-accent-300/50 dark:from-accent-200/75 dark:to-accent-50/50 backdrop-blur-md backdrop-saturate-50 text-neutral-50">
              {renderAccessory && renderAccessory()}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
