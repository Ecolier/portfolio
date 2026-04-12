import type { CollectionConfig } from 'payload'

export const Tag: CollectionConfig = {
  slug: 'tag',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'Name',
  },
  fields: [
    {
      name: 'Name',
      type: 'text',
      required: true,
    },
  ],
}
