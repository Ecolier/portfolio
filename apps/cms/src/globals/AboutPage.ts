import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidateGlobal'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal('/about')],
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: {
        description: 'Page title for SEO. Falls back to "heading — site title".',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Meta description for search engines. Falls back to body excerpt.',
      },
    },
  ],
}
