import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import FluidLink from "@/components/FluidLink";
import { fluidState } from "@/components/TrippyPlane";
import { getAboutPage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/functions/getGlobals";
import {
  localePath,
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";

export const Route = createFileRoute("/{-$locale}/about")({
  component: About,
  loader: async ({ context }) => {
    const locale = (context as { locale: Locale }).locale;
    const [aboutPage, siteSettings] = await Promise.all([
      getAboutPage({ data: locale }),
      getSiteSettings({ data: locale }),
    ]);
    return { aboutPage, siteSettings };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = (params.locale ?? "en") as Locale;
    const canonical = localePath("/about", locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { aboutPage, siteSettings } = loaderData;
    const siteName = siteSettings.siteTitle || "Evan Gruère";
    const title = aboutPage.metaTitle || `${aboutPage.heading} — ${siteName}`;
    const description =
      aboutPage.metaDescription ||
      aboutPage.body?.slice(0, 160) ||
      siteSettings.siteDescription ||
      "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
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
      links: [
        { rel: "canonical", href: canonicalUrl },
        ...hreflangLinks("/about"),
      ],
    };
  },
});

function About() {
  const { aboutPage, siteSettings } = Route.useLoaderData();
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
