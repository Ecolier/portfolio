import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidateGlobal'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal('/', '/about')],
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Evan Gruère | Software Engineer',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Default meta description for the site.',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'githubUrl',
      type: 'text',
      admin: {
        description: 'Full URL to your GitHub profile.',
      },
    },
    {
      name: 'ui',
      type: 'group',
      label: 'UI Strings',
      admin: {
        description: 'Translatable labels for navigation and buttons.',
      },
      fields: [
        { name: 'navAbout', type: 'text', localized: true, defaultValue: 'About' },
        { name: 'navProjects', type: 'text', localized: true, defaultValue: 'Projects' },
        { name: 'ctaContact', type: 'text', localized: true, defaultValue: 'Get in Touch' },
        { name: 'ctaViewProjects', type: 'text', localized: true, defaultValue: 'View Projects' },
        {
          name: 'ctaBackToProjects',
          type: 'text',
          localized: true,
          defaultValue: 'Back to projects',
        },
        { name: 'ctaSource', type: 'text', localized: true, defaultValue: 'Source' },
        { name: 'ctaWebsite', type: 'text', localized: true, defaultValue: 'Website' },
      ],
    },
  ],
}
