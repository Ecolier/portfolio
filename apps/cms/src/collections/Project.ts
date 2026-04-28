import type { CollectionConfig } from 'payload'
import { revalidateProject } from '../hooks/revalidateProject'

export const Project: CollectionConfig = {
  slug: 'project',
  access: {
    read: () => true,
  },
  orderable: true,
  hooks: {
    afterChange: [revalidateProject],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier, e.g. "portfolio-site".',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 160,
      localized: true,
      admin: {
        description: 'Short summary (≤ 160 chars) used for meta descriptions and social cards.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Used for Open Graph / Twitter social cards.',
      },
    },
    {
      name: 'keywords',
      type: 'relationship',
      hasMany: true,
      relationTo: 'tag',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'repository',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
    },
  ],
}
