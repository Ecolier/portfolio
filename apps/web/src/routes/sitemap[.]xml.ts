import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/locale";
import { CMS_URL } from "@/lib/cms";
import {
  baseLocale,
  generateStaticLocalizedUrls,
  getLocaleForUrl,
  localizeHref,
} from "@/paraglide/runtime.js";

function urlEntry(
  path: string,
  opts: { changefreq: string; priority: number; lastmod?: string },
) {
  const urls = generateStaticLocalizedUrls([`${SITE_URL}${path}`]);
  const xDefault = `${SITE_URL}${localizeHref(path, { locale: baseLocale })}`;
  const links = [
    ...urls.map(
      (url) =>
        `<xhtml:link rel="alternate" hreflang="${getLocaleForUrl(url)}" href="${url.href}"/>`,
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>`,
  ].join("\n    ");

  return urls
    .map(
      (url) => `<url>
    <loc>${url.href}</loc>${opts.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ""}
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
    ${links}
  </url>`,
    )
    .join("\n  ");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [projectsRes] = await Promise.all([
          fetch(`${CMS_URL}/api/project?depth=0&limit=100`),
        ]);
        const projectsData = projectsRes.ok
          ? await projectsRes.json()
          : { docs: [] };

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
          ${urlEntry("/", { changefreq: "weekly", priority: 1.0 })}
          ${urlEntry("/about", { changefreq: "monthly", priority: 0.6 })}
          ${(
            projectsData.docs as Array<{
              id: string;
              slug?: string;
              updatedAt?: string;
            }>
          )
            .map((doc) =>
              urlEntry(`/projects/${doc.slug || doc.id}`, {
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
