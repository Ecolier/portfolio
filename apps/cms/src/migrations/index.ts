import * as migration_20260424_rename_fields_to_camelcase from './20260424_rename_fields_to_camelcase'

export const migrations = [
  {
    slug: '20260424_rename_fields_to_camelcase',
    up: migration_20260424_rename_fields_to_camelcase.up,
    down: migration_20260424_rename_fields_to_camelcase.down,
  },
]
