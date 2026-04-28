import { Link, createFileRoute } from "@tanstack/react-router";
import { getAboutPage, getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
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
  const { aboutPage, siteSettings } = Route.useLoaderData();
  const { locale } = Route.useRouteContext();

  return (
    <main className="page-wrap py-12 bg-(--bg-base)/90 backdrop-blur-sm rounded-2xl my-6 sm:my-10">
      {/* ── Hero: photo + intro ── */}
      <section className="island-shell rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {aboutPage.photo && (
            <img
              src={aboutPage.photo.url}
              alt={aboutPage.photo.alt}
              width={160}
              height={160}
              className="h-32 w-32 shrink-0 rounded-2xl border border-(--line) object-cover shadow-md sm:h-40 sm:w-40"
            />
          )}
          <div className="min-w-0">
            <h1 className="font-display mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
              {aboutPage.heading}
            </h1>
            <p className="m-0 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
              {aboutPage.body}
            </p>
          </div>
        </div>
      </section>

      {/* ── Right now ── */}
      {aboutPage.currentFocus && (
        <section className="island-shell mt-6 rounded-2xl p-8 sm:p-10">
          <h2 className="section-title">Right now</h2>
          <p className="section-body">{aboutPage.currentFocus}</p>
        </section>
      )}

      {/* ── Tools & craft ── */}
      {aboutPage.techIdentity && (
        <section className="island-shell mt-6 rounded-2xl p-8 sm:p-10">
          <h2 className="section-title">Tools &amp; craft</h2>
          <p className="section-body">{aboutPage.techIdentity}</p>
        </section>
      )}

      {/* ── When I'm not coding ── */}
      {aboutPage.interests && (
        <section className="island-shell mt-6 rounded-2xl p-8 sm:p-10">
          <h2 className="section-title">When I&rsquo;m not coding</h2>
          <p className="section-body">{aboutPage.interests}</p>
        </section>
      )}

      {/* ── Let's talk ── */}
      <section className="island-shell mt-6 rounded-2xl p-8 sm:p-10">
        {aboutPage.contactNote && (
          <p className="section-body mb-4">{aboutPage.contactNote}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {siteSettings.contactEmail && (
            <a
              href={`mailto:${siteSettings.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-4 py-2 text-sm font-semibold text-(--sea-ink) no-underline shadow-sm transition hover:bg-(--link-bg-hover)"
            >
              Get in touch
            </a>
          )}
          <Link
            to={localePath("/", locale)}
            className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
          >
            {siteSettings.ui.ctaViewProjects}
          </Link>
          {siteSettings.githubUrl && (
            <a
              href={siteSettings.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) px-4 py-2 text-sm text-(--sea-ink) no-underline transition hover:bg-(--link-bg-hover)"
            >
              GitHub
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
