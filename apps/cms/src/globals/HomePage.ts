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
      defaultValue: 'Your Next Move? Me.',
    },
  ],
}
