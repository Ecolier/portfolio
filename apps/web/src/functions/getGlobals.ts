import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CMS_URL } from "@/lib/cms";
import type { Locale } from "@/lib/locale";

const localeSchema = z.enum(["en", "fr"]);

export type { Locale };

export interface UIStrings {
  navAbout: string;
  navProjects: string;
  ctaContact: string;
  ctaViewProjects: string;
  ctaBackToProjects: string;
  ctaSource: string;
  ctaWebsite: string;
}

export interface HomePageData {
  headline: string;
  subtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface AboutPageData {
  heading: string;
  photo: { url: string; alt: string } | null;
  body: string;
  currentFocus: string | null;
  techIdentity: string | null;
  interests: string | null;
  contactNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface SiteSettingsData {
  siteTitle: string;
  siteDescription: string | null;
  contactEmail: string | null;
  githubUrl: string | null;
  ui: UIStrings;
}

export const getHomePage = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/home-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    return {
      headline: data.headline,
      subtitle: data.subtitle ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    } as HomePageData;
  });

export const getAboutPage = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/about-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    const photo =
      data.photo && typeof data.photo === "object" && data.photo.url
        ? { url: `${CMS_URL}${data.photo.url}`, alt: data.photo.alt || "" }
        : null;
    return {
      heading: data.heading,
      photo,
      body: data.body,
      currentFocus: data.currentFocus ?? null,
      techIdentity: data.techIdentity ?? null,
      interests: data.interests ?? null,
      contactNote: data.contactNote ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    } as AboutPageData;
  });

export const getSiteSettings = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/site-settings?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    return {
      siteTitle: data.siteTitle,
      siteDescription: data.siteDescription ?? null,
      contactEmail: data.contactEmail ?? null,
      githubUrl: data.githubUrl ?? null,
      ui: {
        navAbout: data.ui?.navAbout ?? "About",
        navProjects: data.ui?.navProjects ?? "Projects",
        ctaContact: data.ui?.ctaContact ?? "Get in Touch",
        ctaViewProjects: data.ui?.ctaViewProjects ?? "View Projects",
        ctaBackToProjects: data.ui?.ctaBackToProjects ?? "Back to projects",
        ctaSource: data.ui?.ctaSource ?? "Source",
        ctaWebsite: data.ui?.ctaWebsite ?? "Website",
      },
    } as SiteSettingsData;
  });
