import { createFileRoute, Link } from "@tanstack/react-router";
import { getBlogPosts } from "@/functions/getBlogPosts";
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

export const Route = createFileRoute("/{-$locale}/blog/")({
  component: BlogList,
  loader: async ({ context }) => {
    const locale = context.locale;
    const [posts, siteSettings] = await Promise.all([
      getBlogPosts({ data: locale }),
      getSiteSettings({ data: locale }),
    ]);
    return { posts, siteSettings };
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
    const canonical = localePath("/blog", locale);
    const canonicalUrl = `${SITE_URL}${canonical}`;
    const { siteSettings } = loaderData;
    const siteName = siteSettings.siteTitle || "Evan Gruère";
    const title = `Blog — ${siteName}`;
    const description =
      siteSettings.siteDescription || "Writing by Evan Gruère.";
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
      links: [
        { rel: "canonical", href: canonicalUrl },
        ...hreflangLinks("/blog"),
      ],
    };
  },
});

function BlogList() {
  const { posts } = Route.useLoaderData();
  const { locale } = Route.useRouteContext();

  return (
    <main className="page-wrap py-12">
      <h1 className="font-display mb-10 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
        Blog
      </h1>

      {posts.length === 0 ? (
        <p className="text-(--sea-ink-soft)">No posts yet — check back soon.</p>
      ) : (
        <ol className="flex flex-col gap-6" reversed>
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={localePath(`/blog/${post.slug}`, locale)}
                className="island-shell group block rounded-2xl p-6 no-underline transition hover:shadow-md sm:p-8"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h2 className="m-0 text-xl font-semibold text-(--sea-ink) group-hover:text-(--accent)">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.publishedAt}
                    className="shrink-0 text-sm text-(--sea-ink-soft)"
                  >
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {post.excerpt && (
                  <p className="mt-3 text-base leading-7 text-(--sea-ink-soft)">
                    {post.excerpt}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2 p-0">
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
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
