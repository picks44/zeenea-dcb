import type { ColumnDefinition, SchemaTable, TableRelationship } from '@/types/odcs'

/** ODCS `to` / `from` reference: `table.column` (dot notation per Excel guidance). */
export function relationshipEndpoint(table: string, column?: string): string {
  const t = table.trim()
  const c = column?.trim()
  if (!t) return ''
  return c ? `${t}.${c}` : t
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

/** Property-level foreignKey entries for YAML export. */
export function buildPropertyForeignKeys(
  table: SchemaTable,
): Map<string, Record<string, unknown>[]> {
  const byColumn = new Map<string, Record<string, unknown>[]>()

  const add = (columnName: string, to: string) => {
    if (!columnName.trim() || !to.trim()) return
    const entry = { type: 'foreignKey', to }
    const list = byColumn.get(columnName) ?? []
    list.push(entry)
    byColumn.set(columnName, list)
  }

  for (const col of table.columns) {
    if (isColumnForeignKeyComplete(col.foreignKey)) {
      add(
        col.physicalName,
        relationshipEndpoint(col.foreignKey!.toTable, col.foreignKey!.toColumn),
      )
    }
  }

  for (const rel of table.relationships ?? []) {
    if (!isLegacySingleColumnBelongsTo(rel) || !rel.fromColumn?.trim()) continue
    const to = relationshipEndpoint(rel.toTable, rel.toColumn)
    add(rel.fromColumn, to)
  }

  return byColumn
}

/** Table/object-level relationships for YAML export (composite FK + many-to-many). */
export function buildSchemaLevelRelationships(table: SchemaTable): Record<string, unknown>[] {
  const schemaRels: Record<string, unknown>[] = []
  const tbl = table.physicalName

  for (const rel of table.relationships ?? []) {
    if (rel.type === 'many_to_many') {
      schemaRels.push({
        type: 'manyToMany',
        from: [rel.fromColumn ? `${tbl}.${rel.fromColumn}` : tbl],
        to: [rel.toColumn ? `${relationshipEndpoint(rel.toTable, rel.toColumn)}` : rel.toTable],
      })
      continue
    }

    if (!isCompositeTableRelationship(rel) || isCompositeRelationshipIncomplete(rel)) continue

    const fromCols = (rel.fromColumns ?? []).map(c => c.trim()).filter(Boolean)
    const toCols = (rel.toColumns ?? []).map(c => c.trim()).filter(Boolean)
    if (fromCols.length < 2 || toCols.length < 2) continue

    schemaRels.push({
      type: 'foreignKey',
      from: fromCols.map(c => `${tbl}.${c}`),
      to: toCols.map(c => relationshipEndpoint(rel.toTable, c)),
    })
  }

  return schemaRels
}
