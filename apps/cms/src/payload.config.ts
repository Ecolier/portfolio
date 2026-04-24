import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import type { Config } from '@portfolio/types'

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Project } from './collections/Project'
import { Tag } from './collections/Tag'
import { migrations } from './migrations'

import { HomePage } from './globals/HomePage'
import { AboutPage } from './globals/AboutPage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const workspaceRoot = path.resolve(dirname, '../../..')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Users, Media, Project, Tag],
  globals: [HomePage, AboutPage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.join(workspaceRoot, 'packages/types/generated.ts'),
    declare: false,
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
})
