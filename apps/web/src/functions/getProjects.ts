import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { CMS_URL, CMS_PUBLIC_URL } from "@/lib/cms";
import { localeSchema } from "@/lib/locale";
import { z } from "zod";

import type { Media, Project as ProjectDoc } from "@portfolio/types";
import type { NormalizedMedia, Project } from "#/types/project";

type UnknownRecord = Record<string, unknown>;
type MediaWithSizes = Media & {
  sizes?: NormalizedMedia["sizes"];
};

function absoluteCMSUrl(url?: string | null) {
  if (!url) return url;
  return url.startsWith("http") ? url : `${CMS_PUBLIC_URL}${url}`;
}

function normalizeMedia(media: Media | string | null | undefined) {
  if (!media || typeof media !== "object") return null;
  const mediaWithSizes = media as MediaWithSizes;

  const normalized = {
    ...media,
    url: absoluteCMSUrl(media.url),
    thumbnailURL: absoluteCMSUrl(media.thumbnailURL),
    sizes: mediaWithSizes.sizes
      ? Object.fromEntries(
          Object.entries(mediaWithSizes.sizes).map(([key, size]) => [
            key,
            size && typeof size === "object"
              ? {
                  ...size,
                  url: absoluteCMSUrl(size.url),
                }
              : size,
          ]),
        )
      : mediaWithSizes.sizes,
  } satisfies NormalizedMedia;

  return normalized;
}

function normalizeRichTextUploads(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeRichTextUploads);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as UnknownRecord;
  const normalized: UnknownRecord = {};

  for (const [key, childValue] of Object.entries(record)) {
    normalized[key] = normalizeRichTextUploads(childValue);
  }

  if (record.type === "upload") {
    normalized.value = normalizeMedia(record.value as Media | string | null);
  }

  return normalized;
}

function normalizeProject(doc: ProjectDoc): Project {
  const iconImage = normalizeMedia(doc.iconImage);
  const detailImage = normalizeMedia(doc.detailImage);
  const keywords = (doc.keywords ?? []).map((kw) =>
    typeof kw === "string" ? kw : kw.name,
  );
  const description = normalizeRichTextUploads(doc.description);

  return { ...doc, description, iconImage, detailImage, keywords } as Project;
}

export const getProjects = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/project?depth=1&limit=20&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();

    return (data.docs as ProjectDoc[]).map(normalizeProject);
  });

export const getProject = createServerFn()
  .inputValidator(z.object({ slug: z.string().min(1), locale: localeSchema }))
  .handler(async ({ data: { slug, locale } }) => {
    const res = await fetch(
      `${CMS_URL}/api/project?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    const doc = data.docs[0];
    if (!doc) throw notFound();

    return normalizeProject(doc as ProjectDoc);
  });
