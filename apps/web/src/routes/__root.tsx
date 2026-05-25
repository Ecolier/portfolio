import { createRootRouteWithContext } from "@tanstack/react-router";
import type { Locale } from "@/lib/locale";
import RootDocument from "./-root/RootDocument";
import RootLayout from "./-root/RootLayout";
import { rootBeforeLoad, rootLoader } from "./-root/rootData";
import { rootHead } from "./-root/rootHead";

export interface RouterContext {
  locale: Locale;
  initialTheme: "light" | "dark";
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: rootBeforeLoad,
  loader: rootLoader,
  head: rootHead,
  component: RootLayout,
  shellComponent: RootDocument,
});
