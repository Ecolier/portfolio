import type { CollectionConfig } from 'payload'
import { revalidateProject } from '../hooks/revalidateProject'

export const Project: CollectionConfig = {
  slug: 'project',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateProject],
  },
  fields: [
    {
      name: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier, e.g. "portfolio-site".',
      },
    },
    {
      name: 'Excerpt',
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'Short summary (≤ 160 chars) used for meta descriptions and social cards.',
      },
    },
    {
      name: 'CoverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Used for Open Graph / Twitter social cards.',
      },
    },
    {
      name: 'Keywords',
      type: 'relationship',
      hasMany: true,
      relationTo: 'tag',
    },
    {
      name: 'Company',
      type: 'text',
    },
    {
      name: 'Repository',
      type: 'text',
    },
    {
      name: 'Website',
      type: 'text',
    },
    {
      name: 'Description',
      type: 'richText',
      required: true,
    },
  ],
}
