import { createServerFn } from "@tanstack/react-start";

const CMS_URL = "http://localhost:3001";

export type Locale = "en" | "fr";

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
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface AboutPageData {
  heading: string;
  body: string;
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
  .inputValidator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/home-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    return {
      headline: data.headline,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    } as HomePageData;
  });

export const getAboutPage = createServerFn()
  .inputValidator((locale: Locale) => locale)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/about-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = await res.json();
    return {
      heading: data.heading,
      body: data.body,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    } as AboutPageData;
  });

export const getSiteSettings = createServerFn()
  .inputValidator((locale: Locale) => locale)
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
