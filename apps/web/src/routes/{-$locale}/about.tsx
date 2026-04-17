import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";
import FluidLink from "../../components/FluidLink";
import { fluidState } from "../../components/TrippyPlane";
import { getAboutPage } from "../../functions/getGlobals";
import type { Locale } from "../../functions/getGlobals";
import { localePath, hreflangLinks } from "../../lib/locale";

const localeRoute = getRouteApi("/{-$locale}");

export const Route = createFileRoute("/{-$locale}/about")({
  component: About,
  loader: ({ context }) => {
    const locale = (context as { locale: Locale }).locale;
    return getAboutPage({ data: locale });
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  head: ({ params }) => {
    const locale = (params.locale ?? "en") as Locale;
    const canonical = localePath("/about", locale);
    return {
      meta: [
        { title: "About — Evan Gruère" },
        {
          name: "description",
          content:
            "Learn about Evan Gruère — software engineer, builder, and open-source enthusiast.",
        },
        { property: "og:title", content: "About — Evan Gruère" },
        {
          property: "og:description",
          content: "Learn about Evan Gruère — software engineer.",
        },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "About — Evan Gruère" },
      ],
      links: [
        { rel: "canonical", href: `https://gruere.dev${canonical}` },
        ...hreflangLinks("/about"),
      ],
    };
  },
});

function About() {
  const aboutPage = Route.useLoaderData();
  const siteSettings = localeRoute.useLoaderData();
  const { locale } = Route.useRouteContext() as { locale: Locale };

  useEffect(() => {
    fluidState.targetScale = 0.6;
    return () => {
      fluidState.targetScale = 1.0;
    };
  }, []);

  return (
    <main className="page-wrap px-4 py-12 bg-(--bg-base)/90 backdrop-blur-sm rounded-2xl my-4">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          {aboutPage.heading}
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          {aboutPage.body}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <FluidLink
            to={localePath("/", locale)}
            className="fluid-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
          >
            {siteSettings.ui.ctaViewProjects}
          </FluidLink>
          {siteSettings.githubUrl && (
            <a
              href={siteSettings.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="fluid-cta inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
            >
              GitHub
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
