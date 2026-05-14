import type { PropsWithChildren } from "react";

export default function NavAccessory({ children }: PropsWithChildren) {
  return (
    <div className="text-neutral-50 nav-accessory-shape bg-linear-to-tl from-accent-500/75 to-accent-300/50 dark:from-accent-200/75 dark:to-accent-50/50 backdrop-blur-md backdrop-saturate-50">
      <div
        className="absolute inset-0 nav-accessory-highlight bg-accent-50/90 dark:bg-accent-50/30 backdrop-blur-md backdrop-saturate-50"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 nav-accessory-shadow bg-accent-950/30 dark:bg-accent-950/90 backdrop-blur-md backdrop-saturate-50"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
