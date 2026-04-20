import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import type { Locale } from "@/lib/locale";
import { CMS_URL } from "@/lib/cms";

const localeSchema = z.enum(["en", "fr"]);

interface MediaDoc {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ProjectDoc {
  id: string;
  Name: string;
  Slug: string;
  Excerpt?: string | null;
  CoverImage?: MediaDoc | string | null;
  Keywords?: ({ Name: string; id: string } | string)[] | string | null;
  Company?: string | null;
  Repository?: string | null;
  Website?: string | null;
  Description: { root: { children: unknown[] } };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  excerpt: string | null;
  coverImage: { url: string; alt: string } | null;
  keywords: string[];
  company: string | null;
  repository: string | null;
  website: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

function extractText(node: unknown): string {
  if (typeof node !== "object" || node === null) return "";
  const n = node as Record<string, unknown>;
  if (typeof n.text === "string") return n.text;
  if (Array.isArray(n.children)) return n.children.map(extractText).join("");
  return "";
}

function normalizeKeywords(keywords: ProjectDoc["Keywords"]): string[] {
  if (!keywords) return [];
  if (typeof keywords === "string")
    return keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return keywords
    .map((k) => (typeof k === "object" && k !== null ? k.Name : null))
    .filter((k): k is string => k !== null);
}

function normalizeCover(
  cover: ProjectDoc["CoverImage"],
): Project["coverImage"] {
  if (!cover || typeof cover === "string") return null;
  return { url: `${CMS_URL}${cover.url}`, alt: cover.alt };
}

function mapProject(doc: ProjectDoc, joinSep: string): Project {
  return {
    id: doc.id,
    slug: doc.Slug,
    name: doc.Name,
    excerpt: doc.Excerpt ?? null,
    coverImage: normalizeCover(doc.CoverImage),
    keywords: normalizeKeywords(doc.Keywords),
    company: doc.Company ?? null,
    repository: doc.Repository ?? null,
    website: doc.Website ?? null,
    description:
      doc.Description?.root?.children
        ?.map((block) => extractText(block))
        .filter(Boolean)
        .join(joinSep) ?? "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const getProjects = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/project?depth=1&limit=20&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();

    return (data.docs as ProjectDoc[]).map((doc) => mapProject(doc, " "));
  });

export const getProject = createServerFn()
  .inputValidator(z.object({ slug: z.string().min(1), locale: localeSchema }))
  .handler(async ({ data: { slug, locale } }) => {
    const res = await fetch(
      `${CMS_URL}/api/project?where[Slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1&locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    const doc = (data.docs as ProjectDoc[])[0];
    if (!doc) throw notFound();

    return mapProject(doc, "\n\n");
  });
