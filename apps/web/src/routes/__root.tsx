import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import TrippyPlane from "@/components/TrippyPlane";

import appCss from "@/styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

const LANG_INIT_SCRIPT = `(function(){var s=location.pathname.split('/');document.documentElement.lang=s[1]==='fr'?'fr':'en'})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    const isBot = /bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(
      navigator.userAgent,
    );
    if (!isBot) setShowCanvas(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-(--selection-bg) flex flex-col min-h-[100dvh]">
        {showCanvas && (
          <div
            className="fixed -z-10"
            style={{
              top: "calc(-1 * env(safe-area-inset-top, 0px))",
              right: "calc(-1 * env(safe-area-inset-right, 0px))",
              bottom: "calc(-1 * env(safe-area-inset-bottom, 0px))",
              left: "calc(-1 * env(safe-area-inset-left, 0px))",
            }}
          >
            <Canvas
              camera={{ position: [0, 3, 12], fov: 55, near: 0.1, far: 200 }}
              style={{ width: "100%", height: "100%" }}
            >
              <TrippyPlane />
            </Canvas>
          </div>
        )}
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
