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
      defaultValue: 'Evan Gruère | Software Engineer',
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
  ],
}
