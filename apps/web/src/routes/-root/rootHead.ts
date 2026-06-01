import appCss from "@/styles.css?url";

type RootHeadMatch = {
  status: string;
  globalNotFound?: boolean;
};

export function rootHead({ matches }: { matches: RootHeadMatch[] }) {
  const shouldNoIndex = matches.some(
    (match) =>
      match.status === "notFound" ||
      match.status === "error" ||
      match.globalNotFound,
  );

  return {
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      ...(shouldNoIndex
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : []),
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
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Outfit:wght@400;500;600;700;800&display=swap",
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
  };
}
