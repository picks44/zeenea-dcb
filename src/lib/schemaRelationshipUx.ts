import type { SchemaTable } from '@/types/odcs'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'

export interface TableRelationshipCounts {
  fieldFk: number
  tableRel: number
  composite: number
  total: number
}

export function countTableRelationships(table: SchemaTable): TableRelationshipCounts {
  const fieldFk = table.columns.filter(c => isColumnForeignKeyComplete(c.foreignKey)).length
  const tableRel = table.relationships?.length ?? 0
  const composite = (table.relationships ?? []).filter(r => r.type === 'composite_foreign_key').length
  return {
    fieldFk,
    tableRel,
    composite,
    total: fieldFk + tableRel,
  }
}

/** Compact header label, e.g. "2 FK · 1 composite". */
export function formatRelationshipHeaderSummary(counts: TableRelationshipCounts): string | null {
  if (counts.total === 0) return null
  const parts: string[] = []
  if (counts.fieldFk > 0) {
    parts.push(`${counts.fieldFk} FK`)
  }
  if (counts.composite > 0) {
    parts.push(`${counts.composite} composite`)
  } else if (counts.tableRel > counts.composite) {
    const other = counts.tableRel - counts.composite
    if (other > 0) {
      parts.push(`${other} table`)
    }
  }
  if (parts.length === 0 && counts.tableRel > 0) {
    parts.push(`${counts.tableRel} table`)
  }
  return parts.join(' · ')
}
