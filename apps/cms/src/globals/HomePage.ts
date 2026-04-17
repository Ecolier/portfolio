import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidateGlobal'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal('/')],
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Your Next Move? Me.',
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: {
        description: 'Page title for SEO. Falls back to the site title.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Meta description for search engines.',
      },
    },
  ],
}
