import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProject } from "@/functions/getProjects";
import type { Locale } from "@/lib/locale";
import {
  localePath,
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";

const localeRoute = getRouteApi("/{-$locale}");

export const Route = createFileRoute("/{-$locale}/projects/$slug")({
  component: ProjectDetail,
  loader: ({ params, context }) => {
    const locale = context.locale;
    return getProject({ data: { slug: params.slug, locale } });
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = (params.locale ?? "en") as Locale;
    const slug = params.slug;
    const basePath = `/projects/${slug}`;
    const canonical = localePath(basePath, locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const title = `${loaderData.name}${loaderData.company ? ` — ${loaderData.company}` : ""} | Evan Gruère`;
    const description =
      loaderData.excerpt ||
      loaderData.description?.slice(0, 160) ||
      `${loaderData.name} — a project by Evan Gruère.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: "Evan Gruère" },
        { property: "og:locale", content: ogLocale(locale) },
        ...ogLocaleAlternates(locale).map((alt) => ({
          property: "og:locale:alternate",
          content: alt,
        })),
        ...(loaderData.coverImage
          ? [
              {
                property: "og:image",
                content: loaderData.coverImage.url,
              },
              {
                property: "og:image:alt",
                content: loaderData.coverImage.alt,
              },
              { name: "twitter:card", content: "summary_large_image" },
              {
                name: "twitter:image",
                content: loaderData.coverImage.url,
              },
            ]
          : [{ name: "twitter:card", content: "summary" }]),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(loaderData.keywords.length > 0
          ? [{ name: "keywords", content: loaderData.keywords.join(", ") }]
          : []),
        {
          property: "article:published_time",
          content: loaderData.createdAt,
        },
        {
          property: "article:modified_time",
          content: loaderData.updatedAt,
        },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
        ...hreflangLinks(basePath),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: loaderData.name,
            description,
            ...(loaderData.coverImage && {
              image: loaderData.coverImage.url,
            }),
            ...(loaderData.company && {
              sourceOrganization: {
                "@type": "Organization",
                name: loaderData.company,
              },
            }),
            ...(loaderData.repository && {
              codeRepository: loaderData.repository,
            }),
            ...(loaderData.website && { url: loaderData.website }),
            keywords: loaderData.keywords,
            dateCreated: loaderData.createdAt,
            dateModified: loaderData.updatedAt,
            author: {
              "@type": "Person",
              name: "Evan Gruère",
              url: "https://gruere.dev",
            },
          }),
        },
      ],
    };
  },
});

function ProjectDetail() {
  const project = Route.useLoaderData();
  const siteSettings = localeRoute.useLoaderData();
  const { locale } = Route.useRouteContext();

  return (
    <main className="flex flex-1 flex-col">
      <section className="page-wrap flex flex-1 flex-col px-4 py-16 sm:py-24">
        <Link
          to={localePath("/", locale)}
          hash="projects"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-(--sea-ink-soft) no-underline transition hover:text-(--sea-ink)"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {siteSettings.ui.ctaBackToProjects}
        </Link>

        <article className="rounded-2xl border border-(--line) bg-(--surface) p-6 sm:p-10">
          {project.company && (
            <p className="island-kicker mb-2">{project.company}</p>
          )}

          <h1 className="font-display mb-4 text-3xl font-bold text-(--sea-ink) sm:text-5xl">
            {project.name}
          </h1>

          {project.keywords.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {project.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1 text-xs text-(--sea-ink-soft)"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {project.description && (
            <div className="max-w-3xl space-y-4 text-base leading-8 text-(--sea-ink-soft)">
              {project.description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noreferrer"
                className="fluid-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
              >
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  width="16"
                  height="16"
                >
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
                {siteSettings.ui.ctaSource}
              </a>
            )}
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noreferrer"
                className="fluid-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
              >
                <ArrowUpRight size={16} aria-hidden="true" />
                {siteSettings.ui.ctaWebsite}
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
