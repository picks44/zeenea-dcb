import type { ColumnDefinition, SchemaTable } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'
import {
  filterAuthoritativeDefinitionsForPersist,
  filterQualityRulesForSave,
  normalizeTags,
} from '@/lib/odcsSharedMappers'

/** Field row has documentation or governance metadata worth surfacing in the UI. */
export function hasFieldMetadata(column: ColumnDefinition): boolean {
  return Boolean(
    column.description?.trim()
    || (column.quality?.length ?? 0) > 0
    || column.qualityRule?.trim()
    || isColumnForeignKeyComplete(column.foreignKey),
  )
}

/** Table has documentation, governance, or table-level relationship metadata. */
export function hasTableMetadata(table: SchemaTable): boolean {
  return Boolean(
    table.description?.trim()
    || normalizeTags(table.tags).length > 0
    || filterQualityRulesForSave(table.quality ?? []).length > 0
    || filterAuthoritativeDefinitionsForPersist(table.authoritativeDefinitions ?? []).length > 0
    || (table.relationships?.length ?? 0) > 0,
  )
}

/** Shared schema metadata/settings CTA styles (field + table parity). */
export function schemaMetadataButtonClass(
  active: boolean,
  options?: { inFieldRow?: boolean; className?: string },
): string {
  return cn(
    'h-6 w-6 rounded flex items-center justify-center transition-all flex-shrink-0',
    active
      ? 'text-[#0550dc] bg-[#f0f4ff]'
      : cn(
          'text-[#d3d3e5] hover:!text-[#0550dc] hover:bg-[#f0f4ff]',
          options?.inFieldRow && 'group-hover:text-[#9898a7]',
        ),
    options?.className,
  )
}
