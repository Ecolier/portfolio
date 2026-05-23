import { type PropsWithChildren, type ReactNode } from "react";
import { m } from "@/paraglide/messages.js";

export interface NavLink {
  to: string;
  label: string;
  active?: boolean;
}

export interface NavProps extends PropsWithChildren {
  renderAccessory?: () => ReactNode;
}

export default function Nav({ renderAccessory, children }: NavProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-1 nav-drop-shadow z-[-100]"></div>
        <div
          className="absolute inset-0 -z-10 
          nav-shape bg-linear-to-t
          from-neutral-50/90 to-neutral-10/75
          dark:from-panel-bg/95 dark:to-panel-bg-soft/80
          backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 nav-highlight bg-linear-to-t from-neutral-10/25 to-neutral-10/50 dark:from-neutral-50/5 dark:to-neutral-50/12 backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 nav-accent-l bg-accent-solid backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="hidden sm:block absolute inset-0 nav-accent-r bg-accent-solid backdrop-blur-md backdrop-saturate-50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 nav-shadow bg-linear-to-t from-neutral-950/10 to-neutral-950/5 dark:from-black/65 dark:to-black/20 backdrop-blur-xl backdrop-saturate-200"
          aria-hidden="true"
        />

        <nav
          className="flex items-center pl-3 sm:pl-6 mx-3 gap-cta"
          aria-label={m.label_main_navigation()}
        >
          <div className="flex grow items-center gap-nav">{children}</div>
          <div className="-mr-3 shrink justify-self-end cta-shape">
            {renderAccessory && renderAccessory()}
          </div>
        </nav>
      </div>
    </>
  );
}
