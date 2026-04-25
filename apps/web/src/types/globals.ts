import type {
  HomePage as HomePageDoc,
  AboutPage as AboutPageDoc,
  SiteSetting as SiteSettingDoc,
} from "@portfolio/types";

type BaseFields = "id" | "updatedAt" | "createdAt";

export interface UIStrings {
  navAbout: string;
  navProjects: string;
  ctaContact: string;
  ctaViewProjects: string;
  ctaBackToProjects: string;
  ctaSource: string;
  ctaWebsite: string;
}

export type HomePage = Omit<
  HomePageDoc,
  BaseFields | "subtitle" | "metaTitle" | "metaDescription"
> & {
  subtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type AboutPage = Omit<
  AboutPageDoc,
  | BaseFields
  | "photo"
  | "currentFocus"
  | "techIdentity"
  | "interests"
  | "contactNote"
  | "metaTitle"
  | "metaDescription"
> & {
  photo: { url: string; alt: string } | null;
  currentFocus: string | null;
  techIdentity: string | null;
  interests: string | null;
  contactNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type SiteSetting = Omit<
  SiteSettingDoc,
  BaseFields | "siteDescription" | "contactEmail" | "githubUrl" | "ui"
> & {
  siteDescription: string | null;
  contactEmail: string | null;
  githubUrl: string | null;
  ui: UIStrings;
};
