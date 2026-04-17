import { createServerFn } from "@tanstack/react-start";

const CMS_URL = "http://localhost:3001";

export interface HomePageData {
  headline: string;
}

export interface AboutPageData {
  heading: string;
  body: string;
}

export interface SiteSettingsData {
  siteTitle: string;
  contactEmail: string | null;
  githubUrl: string | null;
}

export const getHomePage = createServerFn().handler(async () => {
  const res = await fetch(`${CMS_URL}/api/globals/home-page`);
  if (!res.ok) throw new Error(`CMS responded ${res.status}`);
  const data = await res.json();
  return {
    headline: data.headline,
  } as HomePageData;
});

export const getAboutPage = createServerFn().handler(async () => {
  const res = await fetch(`${CMS_URL}/api/globals/about-page`);
  if (!res.ok) throw new Error(`CMS responded ${res.status}`);
  const data = await res.json();
  return {
    heading: data.heading,
    body: data.body,
  } as AboutPageData;
});

export const getSiteSettings = createServerFn().handler(async () => {
  const res = await fetch(`${CMS_URL}/api/globals/site-settings`);
  if (!res.ok) throw new Error(`CMS responded ${res.status}`);
  const data = await res.json();
  return {
    siteTitle: data.siteTitle,
    contactEmail: data.contactEmail ?? null,
    githubUrl: data.githubUrl ?? null,
  } as SiteSettingsData;
});
