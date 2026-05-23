import { createFileRoute } from "@tanstack/react-router";
import { getAboutPage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import {
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
} from "@/lib/locale";
import { localizeHref } from "@/paraglide/runtime.js";

export const Route = createFileRoute("/about/")({
  staticData: {
    pageClass: "bg-page-bg",
  },
  component: About,
  loader: async ({ context }) => {
    const locale = context.locale;
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
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const locale = match.context.locale as Locale;
    const canonical = localizeHref("/about", { locale });
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
        ...(aboutPage.photo
          ? [
              {
                rel: "preload",
                as: "image",
                href: aboutPage.photo.url,
              },
            ]
          : []),
      ],
    };
  },
});

function About() {
  const { aboutPage } = Route.useLoaderData();
  return (
    <main className="w-page mx-auto pt-12 relative">
      <section className="flex flex-col gap-6 sm:items-start">
        {aboutPage.photo && (
          <div className="flex mb-4 items-center">
            <div className="relative inline-block z-10">
              <img
                src={aboutPage.photo.url}
                alt={aboutPage.photo.alt}
                width={160}
                height={160}
                className="w-40 object-cover rounded-full border-page-bg border-6 border-solid max-w-none shadow-[0_14px_36px_-24px_var(--color-elevation-shadow)]"
              />
            </div>
            <h1 className="type-heading z-10 ml-8">
              {aboutPage.heading.split(" ").map((word: string) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
            </h1>
          </div>
        )}
        <div className="min-w-0 mx-4 z-10">
          <p className="type-body m-0 max-w-3xl whitespace-pre-line">
            {aboutPage.body}
          </p>
        </div>
      </section>
    </main>
  );
}
