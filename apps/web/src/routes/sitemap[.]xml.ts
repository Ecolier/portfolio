import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://gruere.dev";

function urlEntry(
  path: string,
  opts: { changefreq: string; priority: number; lastmod?: string },
) {
  const en = `${SITE_URL}${path}`;
  const fr = `${SITE_URL}/fr${path}`;
  return `<url>
    <loc>${en}</loc>${opts.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ""}
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>
  <url>
    <loc>${fr}</loc>${opts.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ""}
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const res = await fetch(
          "http://localhost:3001/api/project?depth=0&limit=100",
        );
        const data = res.ok ? await res.json() : { docs: [] };

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urlEntry("/", { changefreq: "weekly", priority: 1.0 })}
  ${urlEntry("/about", { changefreq: "monthly", priority: 0.6 })}
  ${(data.docs as Array<{ id: string; Slug?: string; updatedAt?: string }>)
    .map((doc) =>
      urlEntry(`/projects/${doc.Slug || doc.id}`, {
        changefreq: "weekly",
        priority: 0.8,
        lastmod: doc.updatedAt
          ? new Date(doc.updatedAt).toISOString().split("T")[0]
          : undefined,
      }),
    )
    .join("\n  ")}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control":
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
