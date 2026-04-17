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
  ],
}
