import type { CollectionConfig } from 'payload'

export const Project: CollectionConfig = {
  slug: 'project',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'Name',
      type: 'text',
      required: true,
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
