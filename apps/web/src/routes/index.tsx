import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { getProjects } from "@/functions/getProjects";
import { getHomePage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import {
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";
import { Link } from "lucide-react";
import { localizeHref } from "@/paraglide/runtime.js";
import { m } from "@/paraglide/messages.js";
import { cleanMetaContent, SITE_NAME, socialImageMeta } from "@/lib/seo";
import topographyUrl from "@/assets/topography.svg?url";

export const Route = createFileRoute("/")({
  staticData: {
    pageClass: "bg-panel-bg",
  },
  component: Home,
  loader: async ({ context }) => {
    const locale = context.locale;
    const [projects, homePage, siteSettings] = await Promise.all([
      getProjects({ data: locale }),
      getHomePage({ data: locale }),
      getSiteSettings({ data: locale }),
    ]);
    return { projects, homePage, siteSettings };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const locale = match.context.locale as Locale;
    const canonical = localizeHref("/", { locale });
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { homePage, siteSettings } = loaderData;
    const title =
      homePage.metaTitle || siteSettings.siteTitle || "Evan Gruère's Portfolio";
    const description = cleanMetaContent(
      homePage.metaDescription ||
        siteSettings.siteDescription ||
        "Portfolio of Evan Gruère, software engineer.",
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: ogLocale(locale) },
        ...ogLocaleAlternates(locale).map((alt) => ({
          property: "og:locale:alternate",
          content: alt,
        })),
        ...socialImageMeta(undefined, description),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }, ...hreflangLinks("/")],
    };
  },
});

function Home() {
  const loaderData = Route.useLoaderData() as {
    projects: Array<{
      id: string;
      slug: string;
      name: string;
      company?: string | null;
      excerpt?: string | null;
      description?: string | null;
      keywords: string[];
      iconImage?: {
        url: string;
        alt: string;
        width?: number | null;
        height?: number | null;
      } | null;
      repository?: string | null;
      website?: string | null;
    }>;
    homePage: {
      headline: string;
      subtitle?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
    };
    siteSettings: {
      contactEmail?: string | null;
      siteTitle?: string | null;
      siteDescription?: string | null;
    };
  };
  const { projects, homePage } = loaderData;
  const { locale } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-12 bg-page-bg">
      <div className="relative">
        <div className="hero-shape bg-panel-bg">
          <div
            className="hero-topography"
            style={{ "--topography-url": `url(${topographyUrl})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-b from-panel-bg to-panel-bg/0 "></div>
        </div>
        <div className="relative py-12 w-page mx-auto">
          <h1 className="type-heading mb-4">{homePage.headline}</h1>
          <h2 className="type-lede mt-2 max-w-[clamp(34ch,52vw,42ch)]">
            {homePage.subtitle}
          </h2>
        </div>
      </div>
      <main className="flex flex-col w-page mx-auto gap-16">
        {projects.map((project, i) => (
          <section
            key={project.id}
            className="relative flex items-center justify-center"
          >
            <div className="grid grid-flow-col items-center grid-cols-6 grid-rows-2 gap-x-8">
              {project.iconImage?.url && (
                <img
                  src={project.iconImage.url}
                  alt={project.iconImage.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  width={project.iconImage.width || 512}
                  height={project.iconImage.height || 512}
                  className="project-cover aspect-square object-cover row-span-2 col-span-2 rounded-lg"
                />
              )}
              <div className="col-span-4 row-span-2">
                {project.company && (
                  <p className="type-meta mb-2">{project.company}</p>
                )}
                <h2 className="type-title">
                  <RouterLink
                    to={localizeHref(`/projects/${project.slug}`, {
                      locale,
                    })}
                    className="no-underline text-foreground"
                  >
                    {project.name}
                  </RouterLink>
                </h2>
                {project.excerpt && (
                  <p className="type-lede mt-3 max-w-[clamp(38ch,52vw,52ch)]">
                    {project.excerpt}
                  </p>
                )}
                <div className="flex mt-4 align-center justify-end">
                  <RouterLink
                    to={localizeHref(`/projects/${project.slug}`, {
                      locale,
                    })}
                    className="type-button border-b-2 border-b-accent-border text-accent-link hover:text-accent-link-hover inset-shadow-underline py-2"
                  >
                    {m.cta_view_project()}
                  </RouterLink>
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noreferrer"
                      className="self-center ml-4 text-muted-foreground"
                    >
                      <span className="sr-only">{m.label_source_code()}</span>
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        width="18"
                        height="18"
                      >
                        <path
                          fill="currentColor"
                          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                        />
                      </svg>
                    </a>
                  )}
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noreferrer"
                      className="self-center ml-4 text-muted-foreground"
                    >
                      <span className="sr-only">{m.label_visit_website()}</span>
                      <Link size={18} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
