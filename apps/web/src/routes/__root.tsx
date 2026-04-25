import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";
import { Suspense, lazy } from "react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/locale";

import appCss from "@/styles.css?url";

export interface RouterContext {
  locale: Locale;
  initialTheme: "light" | "dark";
}

// Theme-color hex values must stay in sync with --bg-base in styles.css
const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;document.cookie='theme='+resolved+';path=/;max-age=31536000;samesite=lax';var old=document.querySelector('meta[name="theme-color"]');if(old)old.remove();var m=document.createElement('meta');m.name='theme-color';m.content=resolved==='dark'?'#0b1118':'#e8edf3';document.head.appendChild(m);}catch(e){}})();`;

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ context }) => {
    const cookie = getCookie("theme");
    const initialTheme: "light" | "dark" =
      cookie === "dark" || cookie === "light" ? cookie : "light";
    return { ...context, initialTheme };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      {
        rel: "icon",
        href: "/favicon-48.png",
        type: "image/png",
        sizes: "48x48",
      },
      {
        rel: "icon",
        href: "/favicon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1];
  const lang: Locale = (SUPPORTED_LOCALES as string[]).includes(segment)
    ? (segment as Locale)
    : DEFAULT_LOCALE;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body
        className="font-sans antialiased wrap-anywhere selection:bg-(--selection-bg) flex flex-col min-h-dvh"
        suppressHydrationWarning
      >
        {children}
        <Suspense fallback={null}>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
