import {
  HeadContent,
  Outlet,
  Scripts,
  ScriptOnce,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import TrippyPlane from "@/components/TrippyPlane";

import appCss from "@/styles.css?url";

// Runs inline during HTML parsing — sets theme class before any paint
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
    scripts: [{ children: THEME_INIT_SCRIPT }, { children: LANG_INIT_SCRIPT }],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  // false on server AND first client render — body stays opacity:0 until we're ready
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const isBot = /bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(
      navigator.userAgent,
    );
    if (!isBot) setShowCanvas(true);
  }, []);

  // Visible once hydrated AND either canvas is ready or canvas won't be shown
  const visible = hydrated && (canvasReady || !showCanvas);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className="font-sans antialiased wrap-anywhere selection:bg-(--selection-bg) flex flex-col min-h-[100dvh]"
        style={{
          opacity: visible ? 1 : 0,
          transition: hydrated ? "opacity 400ms ease" : "none",
        }}
        suppressHydrationWarning
      >
        <ScriptOnce children={THEME_INIT_SCRIPT} />
        <ScriptOnce children={LANG_INIT_SCRIPT} />
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
              onCreated={() => setCanvasReady(true)}
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
