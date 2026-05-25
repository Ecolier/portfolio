import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/locale";
import { CMS_URL } from "@/lib/cms";
import {
  baseLocale,
  localizeHref,
  locales,
  type Locale,
} from "@/paraglide/runtime.js";

type LocalizedPaths = Partial<Record<Locale, string>>;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hrefFor(locale: Locale, paths: LocalizedPaths) {
  const path = paths[locale] || paths[baseLocale] || "/";
  return `${SITE_URL}${localizeHref(path, { locale })}`;
}

function urlEntry(
  paths: string | LocalizedPaths,
  opts: { changefreq: string; priority: number; lastmod?: string },
) {
  const localizedPaths =
    typeof paths === "string"
      ? (Object.fromEntries(
          locales.map((locale) => [locale, paths]),
        ) as LocalizedPaths)
      : paths;
  const urls = locales.map((locale) => ({
    locale,
    href: hrefFor(locale, localizedPaths),
  }));
  const xDefault = hrefFor(baseLocale, localizedPaths);
  const links = [
    ...urls.map(
      (url) =>
        `<xhtml:link rel="alternate" hreflang="${url.locale}" href="${escapeXml(url.href)}"/>`,
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault)}"/>`,
  ].join("\n    ");

  return urls
    .map(
      (url) => `<url>
    <loc>${escapeXml(url.href)}</loc>${opts.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ""}
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
        const projectResponses = await Promise.all(
          locales.map(async (locale) => {
            const res = await fetch(
              `${CMS_URL}/api/project?depth=0&limit=100&locale=${locale}`,
            );
            return {
              locale,
              data: res.ok ? await res.json() : { docs: [] },
            };
          }),
        );

        const projects = new Map<
          string,
          { paths: LocalizedPaths; updatedAt?: string }
        >();

        for (const { locale, data } of projectResponses) {
          for (const doc of data.docs as Array<{
            id: string;
            slug?: string;
            updatedAt?: string;
          }>) {
            const project = projects.get(doc.id) || { paths: {} };
            project.paths[locale] = `/projects/${doc.slug || doc.id}`;
            if (
              doc.updatedAt &&
              (!project.updatedAt || doc.updatedAt > project.updatedAt)
            ) {
              project.updatedAt = doc.updatedAt;
            }
            projects.set(doc.id, project);
          }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
          ${urlEntry("/", { changefreq: "weekly", priority: 1.0 })}
          ${urlEntry("/about", { changefreq: "monthly", priority: 0.6 })}
          ${Array.from(projects.values())
            .map((project) =>
              urlEntry(project.paths, {
                changefreq: "weekly",
                priority: 0.8,
                lastmod: project.updatedAt
                  ? new Date(project.updatedAt).toISOString().split("T")[0]
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
