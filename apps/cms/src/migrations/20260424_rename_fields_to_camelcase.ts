import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { session } = req
  const projectCol = payload.db.collections['project'].collection

  // Drop the old unique index on 'Slug' before renaming to avoid duplicate-null conflicts
  const indexes = await projectCol.indexes()
  if (indexes.some((idx) => idx.name === 'Slug_1')) {
    await projectCol.dropIndex('Slug_1')
  }

  // Rename Project fields: PascalCase → camelCase
  await projectCol.updateMany(
    {},
    {
      $rename: {
        Name: 'name',
        Slug: 'slug',
        Excerpt: 'excerpt',
        CoverImage: 'coverImage',
        Keywords: 'keywords',
        Company: 'company',
        Repository: 'repository',
        Website: 'website',
        Description: 'description',
      },
    },
    { session },
  )

  // Recreate the unique index on the new 'slug' field (idempotent)
  await projectCol.createIndex({ slug: 1 }, { unique: true, background: true, name: 'slug_1' })

  // Rename Tag fields: PascalCase → camelCase
  await payload.db.collections['tag'].collection.updateMany(
    {},
    {
      $rename: {
        Name: 'name',
      },
    },
    { session },
  )
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const { session } = req
  const projectCol = payload.db.collections['project'].collection

  // Drop the camelCase unique index before renaming back
  const indexes = await projectCol.indexes()
  if (indexes.some((idx) => idx.name === 'slug_1')) {
    await projectCol.dropIndex('slug_1')
  }

  // Revert Project fields: camelCase → PascalCase
  await projectCol.updateMany(
    {},
    {
      $rename: {
        name: 'Name',
        slug: 'Slug',
        excerpt: 'Excerpt',
        coverImage: 'CoverImage',
        keywords: 'Keywords',
        company: 'Company',
        repository: 'Repository',
        website: 'Website',
        description: 'Description',
      },
    },
    { session },
  )

  // Restore the original unique index on 'Slug' (idempotent)
  await projectCol.createIndex({ Slug: 1 }, { unique: true, background: true, name: 'Slug_1' })

  // Revert Tag fields: camelCase → PascalCase
  await payload.db.collections['tag'].collection.updateMany(
    {},
    {
      $rename: {
        name: 'Name',
      },
    },
    { session },
  )
}
