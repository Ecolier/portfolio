import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/locale";
import { CMS_URL } from "@/lib/cms";

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
        const [projectsRes, blogRes] = await Promise.all([
          fetch(`${CMS_URL}/api/project?depth=0&limit=100`),
          fetch(`${CMS_URL}/api/blog-post?depth=0&limit=100&sort=-publishedAt`),
        ]);
        const projectsData = projectsRes.ok
          ? await projectsRes.json()
          : { docs: [] };
        const blogData = blogRes.ok ? await blogRes.json() : { docs: [] };

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urlEntry("/", { changefreq: "weekly", priority: 1.0 })}
  ${urlEntry("/about", { changefreq: "monthly", priority: 0.6 })}
  ${urlEntry("/blog", { changefreq: "weekly", priority: 0.8 })}
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
  ${(
    blogData.docs as Array<{
      id: string;
      slug?: string;
      publishedAt?: string;
      updatedAt?: string;
    }>
  )
    .map((doc) =>
      urlEntry(`/blog/${doc.slug || doc.id}`, {
        changefreq: "monthly",
        priority: 0.7,
        lastmod: doc.updatedAt
          ? new Date(doc.updatedAt).toISOString().split("T")[0]
          : doc.publishedAt
            ? new Date(doc.publishedAt).toISOString().split("T")[0]
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
