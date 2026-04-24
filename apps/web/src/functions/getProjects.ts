import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { CMS_URL } from "@/lib/cms";
import { localeSchema } from "@/lib/locale";
import { z } from "zod";

import type { Project as ProjectDoc } from "@portfolio/types";
import type { Project } from "#/types/project";

function normalizeProject(doc: ProjectDoc): Project {
  const coverImage =
    doc.coverImage && typeof doc.coverImage === "object"
      ? {
          url: doc.coverImage.url ? `${CMS_URL}${doc.coverImage.url}` : "",
          alt: doc.coverImage.alt,
        }
      : null;
  const keywords = (doc.keywords ?? []).map((kw) =>
    typeof kw === "string" ? kw : kw.name,
  );
  return { ...doc, coverImage, keywords };
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
