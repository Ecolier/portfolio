import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://gruere.dev";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const res = await fetch(
          "http://localhost:3001/api/project?depth=0&limit=100",
        );
        const data = res.ok ? await res.json() : { docs: [] };

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${(data.docs as Array<{ id: string; Slug?: string; updatedAt?: string }>)
    .map(
      (doc) => `<url>
    <loc>${SITE_URL}/projects/${doc.Slug || doc.id}</loc>${
      doc.updatedAt
        ? `
    <lastmod>${new Date(doc.updatedAt).toISOString().split("T")[0]}</lastmod>`
        : ""
    }
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
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
