import { HeadContent, Scripts, useMatches } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { getLocale } from "@/paraglide/runtime.js";
import ThemeProvider from "#/components/ThemeProvider";

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null;

export default function RootDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageClass =
    useMatches({
      select: (matches) =>
        matches
          .map((match) => match.staticData.pageClass)
          .filter(Boolean)
          .join(" "),
    }) || "bg-page-bg";

  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className={`flex flex-col min-h-dvh
        font-sans ${pageClass}`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Suspense fallback={null}>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
