import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { CMS_URL, CMS_PUBLIC_URL } from "@/lib/cms";
import { localeSchema } from "@/lib/locale";
import { z } from "zod";

import type { BlogPost as BlogPostDoc } from "@portfolio/types";
import type { BlogPost } from "#/types/blog";

function normalizeBlogPost(doc: BlogPostDoc): BlogPost {
  const coverImage =
    doc.coverImage && typeof doc.coverImage === "object"
      ? {
          url: doc.coverImage.url
            ? `${CMS_PUBLIC_URL}${doc.coverImage.url}`
            : "",
          alt: doc.coverImage.alt,
        }
      : null;
  const tags = (doc.tags ?? []).map((t) =>
    typeof t === "string" ? t : t.name,
  );
  return { ...doc, coverImage, tags };
}

export const getBlogPosts = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/blog-post?depth=1&limit=50&sort=-publishedAt&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    return (data.docs as BlogPostDoc[]).map(normalizeBlogPost);
  });

export const getBlogPost = createServerFn()
  .inputValidator(z.object({ slug: z.string().min(1), locale: localeSchema }))
  .handler(async ({ data: { slug, locale } }) => {
    const res = await fetch(
      `${CMS_URL}/api/blog-post?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    const doc = data.docs[0];
    if (!doc) throw notFound();
    return normalizeBlogPost(doc as BlogPostDoc);
  });
