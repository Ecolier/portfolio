import NavLink, { type NavLinkProps } from "./Link";

export interface NavProps {
  links: NavLinkProps[];
  renderLink?: (link: NavLinkProps) => React.ReactNode;
}

export default function Nav({ links, renderLink }: NavProps) {
  return (
    <nav
      className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Main"
    >
      {links.map((link) => (
        <>
          {renderLink ? (
            renderLink(link)
          ) : (
            <NavLink {...link} key={link.href} />
          )}
          <span
            className="relative z-10 text-(--sea-ink-soft) opacity-30"
            aria-hidden="true"
          >
            ·
          </span>
        </>
      ))}
    </nav>
  );
}
