import type { ColumnDefinition, SchemaTable, TableRelationship } from '@/types/odcs'

/** P1 format: `/schema/{schemaId}/properties/{propertyId}` */
export function propertyRelationshipPointer(
  allTables: SchemaTable[],
  toTablePhysicalName: string,
  toColumnPhysicalName: string,
): string {
  const table = allTables.find(t => t.physicalName.trim() === toTablePhysicalName.trim())
  if (!table) return ''
  const col = table.columns.find(c => c.physicalName.trim() === toColumnPhysicalName.trim())
  if (!col) return ''
  return `/schema/${table.id}/properties/${col.id}`
}

export function isColumnForeignKeyComplete(fk: ColumnDefinition['foreignKey']): boolean {
  return Boolean(fk?.toTable?.trim() && fk?.toColumn?.trim())
}

export function isColumnForeignKeyPartial(fk: ColumnDefinition['foreignKey']): boolean {
  if (!fk) return false
  const hasAny = Boolean(fk.toTable?.trim() || fk.toColumn?.trim())
  return hasAny && !isColumnForeignKeyComplete(fk)
}

export function isCompositeTableRelationship(rel: TableRelationship): boolean {
  if (rel.type === 'composite_foreign_key') return true
  const fromCount = rel.fromColumns?.filter(Boolean).length ?? 0
  const toCount = rel.toColumns?.filter(Boolean).length ?? 0
  return fromCount >= 2 || toCount >= 2
}

/** Legacy single-column `belongs_to` at table level (migrated to property export path). */
export function isLegacySingleColumnBelongsTo(rel: TableRelationship): boolean {
  return rel.type === 'belongs_to' && !isCompositeTableRelationship(rel)
}

export function isCompositeRelationshipIncomplete(rel: TableRelationship): boolean {
  if (rel.type === 'many_to_many') return false
  if (!isCompositeTableRelationship(rel) && rel.type !== 'composite_foreign_key') {
    return false
  }
  const from = (rel.fromColumns ?? []).map(c => c.trim()).filter(Boolean)
  const to = (rel.toColumns ?? []).map(c => c.trim()).filter(Boolean)
  if (from.length < 2 || to.length < 2) return true
  if (from.length !== to.length) return true
  return !rel.toTable?.trim()
}

export function isLegacyBelongsToIncomplete(rel: TableRelationship): boolean {
  return isLegacySingleColumnBelongsTo(rel)
    && (!rel.fromColumn?.trim() || !rel.toColumn?.trim())
}

export function isTableRelationshipExported(rel: TableRelationship): boolean {
  if (rel.type === 'many_to_many') return true
  if (isCompositeTableRelationship(rel)) {
    return !isCompositeRelationshipIncomplete(rel)
  }
  if (isLegacySingleColumnBelongsTo(rel)) {
    return !isLegacyBelongsToIncomplete(rel)
  }
  return false
}

export function isTableRelationshipNotPublished(rel: TableRelationship): boolean {
  if (rel.type === 'has_one' || rel.type === 'has_many') return true
  if (isCompositeTableRelationship(rel)) return isCompositeRelationshipIncomplete(rel)
  if (isLegacySingleColumnBelongsTo(rel)) return isLegacyBelongsToIncomplete(rel)
  return !isTableRelationshipExported(rel)
}

/** Property-level foreignKey entries for YAML export (P1: `from` implicit). */
export function buildPropertyForeignKeys(
  table: SchemaTable,
  allTables: SchemaTable[],
): Map<string, Record<string, unknown>[]> {
  const byColumn = new Map<string, Record<string, unknown>[]>()

  const add = (columnName: string, toPointer: string) => {
    if (!columnName.trim() || !toPointer.trim()) return
    const entry = { type: 'foreignKey', to: toPointer }
    const list = byColumn.get(columnName) ?? []
    list.push(entry)
    byColumn.set(columnName, list)
  }

  for (const col of table.columns) {
    if (isColumnForeignKeyComplete(col.foreignKey)) {
      const pointer = propertyRelationshipPointer(
        allTables,
        col.foreignKey!.toTable,
        col.foreignKey!.toColumn,
      )
      if (pointer) add(col.physicalName, pointer)
    }
  }

  for (const rel of table.relationships ?? []) {
    if (!isLegacySingleColumnBelongsTo(rel) || !rel.fromColumn?.trim()) continue
    const pointer = propertyRelationshipPointer(allTables, rel.toTable, rel.toColumn ?? '')
    if (pointer) add(rel.fromColumn, pointer)
  }

  return byColumn
}

/** Table/object-level relationships for YAML export (composite FK + many-to-many). */
export function buildSchemaLevelRelationships(
  table: SchemaTable,
  allTables: SchemaTable[],
): Record<string, unknown>[] {
  const schemaRels: Record<string, unknown>[] = []

  for (const rel of table.relationships ?? []) {
    if (rel.type === 'many_to_many') {
      const fromPointer = rel.fromColumn
        ? `/schema/${table.id}/properties/${table.columns.find(c => c.physicalName === rel.fromColumn)?.id ?? rel.fromColumn}`
        : `/schema/${table.id}`
      const toPointer = rel.toColumn
        ? propertyRelationshipPointer(allTables, rel.toTable, rel.toColumn)
        : `/schema/${allTables.find(t => t.physicalName === rel.toTable)?.id ?? rel.toTable}`
      schemaRels.push({
        type: 'manyToMany',
        from: [fromPointer],
        to: [toPointer],
      })
      continue
    }

    if (!isCompositeTableRelationship(rel) || isCompositeRelationshipIncomplete(rel)) continue

    const fromCols = (rel.fromColumns ?? []).map(c => c.trim()).filter(Boolean)
    const toCols = (rel.toColumns ?? []).map(c => c.trim()).filter(Boolean)
    if (fromCols.length < 2 || toCols.length < 2) continue

    schemaRels.push({
      type: 'foreignKey',
      from: fromCols.map(c => {
        const col = table.columns.find(col => col.physicalName === c)
        return col ? `/schema/${table.id}/properties/${col.id}` : `/schema/${table.id}/properties/${c}`
      }),
      to: toCols.map(c => propertyRelationshipPointer(allTables, rel.toTable, c)).filter(Boolean),
    })
  }

  return schemaRels
}
