import { createServerFn } from "@tanstack/react-start";
import { CMS_URL, CMS_PUBLIC_URL } from "@/lib/cms";
import type {
  HomePage as HomePageDoc,
  SiteSetting as SiteSettingDoc,
  AboutPage as AboutPageDoc,
} from "@portfolio/types";
import type { HomePage, SiteSetting, AboutPage } from "#/types/globals";
import { localeSchema } from "@/lib/locale";

export const getHomePage = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/home-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = (await res.json()) as HomePageDoc;
    return {
      headline: data.headline,
      subtitle: data.subtitle ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    } as HomePage;
  });

export const getAboutPage = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/about-page?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = (await res.json()) as AboutPageDoc;
    const photo =
      data.photo && typeof data.photo === "object" && data.photo.url
        ? {
            url: `${CMS_PUBLIC_URL}${data.photo.url}`,
            alt: data.photo.alt || "",
          }
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
    } as AboutPage;
  });

export const getSiteSettings = createServerFn()
  .inputValidator(localeSchema)
  .handler(async ({ data: locale }) => {
    const res = await fetch(
      `${CMS_URL}/api/globals/site-settings?locale=${locale}`,
    );
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = (await res.json()) as SiteSettingDoc;
    return {
      siteTitle: data.siteTitle,
      siteDescription: data.siteDescription ?? null,
      contactEmail: data.contactEmail ?? null,
      githubUrl: data.githubUrl ?? null,
      ui: {
        navAbout: data.ui?.navAbout ?? "About",
        navBlog: data.ui?.navBlog ?? "Blog",
        navProjects: data.ui?.navProjects ?? "Projects",
        ctaContact: data.ui?.ctaContact ?? "Get in Touch",
        ctaViewProjects: data.ui?.ctaViewProjects ?? "View Projects",
        ctaBackToProjects: data.ui?.ctaBackToProjects ?? "Back to projects",
        ctaSource: data.ui?.ctaSource ?? "Source",
        ctaWebsite: data.ui?.ctaWebsite ?? "Website",
      },
    } as SiteSetting;
  });
