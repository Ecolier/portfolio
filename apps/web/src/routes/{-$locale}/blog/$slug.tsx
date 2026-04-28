import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getBlogPost } from "@/functions/getBlogPosts";
import { getSiteSettings } from "@/functions/getGlobals";
import type { Locale } from "@/lib/locale";
import {
  localePath,
  hreflangLinks,
  SITE_URL,
  ogLocale,
  ogLocaleAlternates,
  DEFAULT_LOCALE,
} from "@/lib/locale";

const localeRoute = getRouteApi("/{-$locale}");

export const Route = createFileRoute("/{-$locale}/blog/$slug")({
  component: BlogPostPage,
  loader: async ({ params, context }) => {
    const locale = context.locale;
    const [post, siteSettings] = await Promise.all([
      getBlogPost({ data: { slug: params.slug, locale } }),
      getSiteSettings({ data: locale }),
    ]);
    return { post, siteSettings };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const locale = (params.locale ?? DEFAULT_LOCALE) as Locale;
    const slug = params.slug;
    const basePath = `/blog/${slug}`;
    const canonical = localePath(basePath, locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { post, siteSettings } = loaderData;
    const siteName = siteSettings.siteTitle || "Evan Gruère";
    const title = `${post.title} — ${siteName}`;
    const description = post.excerpt || `${post.title} by Evan Gruère.`;
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
        ...(post.coverImage
          ? [
              { property: "og:image", content: post.coverImage.url },
              { property: "og:image:alt", content: post.coverImage.alt },
              { name: "twitter:card", content: "summary_large_image" },
              { name: "twitter:image", content: post.coverImage.url },
            ]
          : [{ name: "twitter:card", content: "summary" }]),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(post.tags.length
          ? [{ name: "keywords", content: post.tags.join(", ") }]
          : []),
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
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
            "@type": "BlogPosting",
            headline: post.title,
            description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            ...(post.coverImage && { image: post.coverImage.url }),
            keywords: post.tags,
            author: {
              "@type": "Person",
              name: "Evan Gruère",
              url: "https://gruere.dev",
            },
            publisher: {
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

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const { locale } = localeRoute.useRouteContext();

  return (
    <main className="page-wrap px-4 py-12 sm:px-6">
      {/* Back link */}
      <Link
        to={localePath("/blog", locale)}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-(--sea-ink-soft) no-underline transition hover:text-(--sea-ink)"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Blog
      </Link>

      <article className="island-shell rounded-2xl p-8 sm:p-10">
        {/* Cover image */}
        {post.coverImage && (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            className="mb-8 w-full rounded-xl object-cover"
            style={{ maxHeight: "400px" }}
          />
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display mb-3 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <time
              dateTime={post.publishedAt}
              className="text-sm text-(--sea-ink-soft)"
            >
              {new Date(post.publishedAt).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2 p-0">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-2.5 py-0.5 text-xs text-(--sea-ink-soft)"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-8 text-(--sea-ink-soft)">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Body */}
        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <RichText data={post.body} />
        </div>
      </article>
    </main>
  );
}
