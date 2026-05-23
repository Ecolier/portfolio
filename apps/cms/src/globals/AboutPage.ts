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
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'A personal photo or avatar.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Short personal story — why you build things, what drives you.',
      },
    },
    {
      name: 'currentFocus',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'What you are working on or learning right now.',
      },
    },
    {
      name: 'techIdentity',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Tools and languages you enjoy — prose, not a wall of logos.',
      },
    },
    {
      name: 'interests',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Outside-of-code hobbies and interests.',
      },
    },
    {
      name: 'contactNote',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'What you are open to — freelance, collaboration, etc.',
      },
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
