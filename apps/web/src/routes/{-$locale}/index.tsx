import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { getProjects } from "@/functions/getProjects";
import { getHomePage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/functions/getGlobals";
import {
  localePath,
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";
import ProjectCard from "@/components/ProjectCard";

export const Route = createFileRoute("/{-$locale}/")({
  component: Home,
  loader: async ({ context }) => {
    const locale = (context as { locale: Locale }).locale;
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
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = (params.locale ?? "en") as Locale;
    const canonical = localePath("/", locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { homePage, siteSettings } = loaderData;
    const title = homePage.metaTitle || siteSettings.siteTitle || "Evan Gruère";
    const description =
      homePage.metaDescription ||
      siteSettings.siteDescription ||
      "Portfolio of Evan Gruère, software engineer.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: "Evan Gruère" },
        { property: "og:locale", content: ogLocale(locale) },
        ...ogLocaleAlternates(locale).map((alt) => ({
          property: "og:locale:alternate",
          content: alt,
        })),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }, ...hreflangLinks("/")],
    };
  },
});

function Home() {
  const { projects, homePage, siteSettings } = Route.useLoaderData();
  const { locale } = Route.useRouteContext() as { locale: Locale };
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("rise-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [projects]);

  return (
    <main className="flex-1">
      <section className="flex min-h-svh items-center justify-center">
        <h1 className="display-title rise-in text-center text-4xl font-bold text-(--sea-ink) drop-shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:text-6xl md:text-7xl">
          {homePage.headline}
        </h1>
      </section>

      <section id="projects" className="page-wrap px-4 pb-24">
        <p className="island-kicker mb-6">{siteSettings.ui.navProjects}</p>
        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              phase={i % 3}
              style={{ animationDelay: `${i * 120}ms` }}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
