import type { CollectionConfig } from 'payload'
import { revalidateBlogPost } from '../hooks/revalidateBlogPost'

export const BlogPost: CollectionConfig = {
  slug: 'blog-post',
  access: {
    read: () => true,
  },
  orderable: true,
  hooks: {
    afterChange: [revalidateBlogPost],
  },
  fields: [
    {
      name: 'title',
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
        description: 'URL-friendly identifier, e.g. "building-my-portfolio".',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Publication date displayed on the post.',
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
      name: 'tags',
      type: 'relationship',
      hasMany: true,
      relationTo: 'tag',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
    },
  ],
}
