import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getProject } from "@/functions/getProjects";
import type { Locale } from "@/lib/locale";
import {
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";
import { localizeHref } from "@/paraglide/runtime.js";
import { m } from "@/paraglide/messages.js";
import { cleanMetaContent, SITE_NAME, socialImageMeta } from "@/lib/seo";

export const Route = createFileRoute("/projects/$slug")({
  staticData: {
    pageClass: "bg-page-bg",
  },
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
  head: ({ loaderData, params, match }) => {
    if (!loaderData) return {};
    const locale = match.context.locale as Locale;
    const slug = params.slug;
    const basePath = `/projects/${slug}`;
    const canonical = localizeHref(basePath, { locale });
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const title = `${loaderData.name}${loaderData.company ? ` — ${loaderData.company}` : ""} | Evan Gruère`;
    const description = cleanMetaContent(
      loaderData.excerpt || `${loaderData.name} — a project by Evan Gruère.`,
    );
    const socialImage = loaderData.detailImage?.url;
    const socialImageAlt = loaderData.detailImage?.alt || description;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: ogLocale(locale) },
        ...ogLocaleAlternates(locale).map((alt) => ({
          property: "og:locale:alternate",
          content: alt,
        })),
        ...socialImageMeta(socialImage, socialImageAlt, {
          width: loaderData.detailImage?.width,
          height: loaderData.detailImage?.height,
        }),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(loaderData.keywords?.length
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
            ...(loaderData.detailImage?.url && {
              image: loaderData.detailImage.url,
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
  const { locale } = Route.useRouteContext();

  if (!project) return null;

  return (
    <main className="flex flex-col w-page mx-auto pt-12">
      <section className="">
        <Link
          to={localizeHref("/", { locale })}
          hash="projects"
          className="type-ui mb-8 inline-flex items-center gap-1.5 text-muted-foreground no-underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {m.cta_back_to_projects()}
        </Link>

        <article>
          {project.company && (
            <p className="type-meta mb-2">{project.company}</p>
          )}

          <h1 className="type-heading mb-4">{project.name}</h1>

          {project.keywords && project.keywords.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {project.keywords.map((kw) => (
                <span
                  key={kw}
                  className="type-meta rounded-full border border-panel-border px-3 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {project.detailImage?.url && (
            <img
              src={project.detailImage.url}
              alt={project.detailImage.alt}
              width={project.detailImage.width || 1347}
              height={project.detailImage.height || 757}
              className="mb-12 aspect-video w-full rounded-lg object-cover"
            />
          )}

          {project.description && (
            <div className="max-w-3xl">
              <RichText className="type-prose" data={project.description} />
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noreferrer"
                className="type-button inline-flex items-center gap-2 border-b-2 border-b-accent-border py-2 text-accent-link no-underline inset-shadow-underline hover:text-accent-link-hover"
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
                {m.cta_source()}
              </a>
            )}
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noreferrer"
                className="type-button inline-flex items-center gap-2 border-b-2 border-b-accent-border py-2 text-accent-link no-underline inset-shadow-underline hover:text-accent-link-hover"
              >
                <ArrowUpRight size={16} aria-hidden="true" />
                {m.cta_website()}
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
