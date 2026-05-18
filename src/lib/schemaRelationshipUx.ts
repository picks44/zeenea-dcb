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

export interface RelationshipHeaderSummary {
  label: string
  detailLines: string[]
}

/** Compact header label, e.g. "2 relationships" with optional breakdown. */
export function formatRelationshipHeaderSummary(
  counts: TableRelationshipCounts,
): RelationshipHeaderSummary | null {
  if (counts.total === 0) return null

  const label = `${counts.total} relationship${counts.total === 1 ? '' : 's'}`
  const detailLines: string[] = []

  if (counts.fieldFk > 0) {
    detailLines.push(`${counts.fieldFk} field FK${counts.fieldFk === 1 ? '' : 's'}`)
  }

  if (counts.composite > 0) {
    detailLines.push(`${counts.composite} composite FK${counts.composite === 1 ? '' : 's'}`)
  }

  const otherTableRel = counts.tableRel - counts.composite
  if (otherTableRel > 0) {
    detailLines.push(
      `${otherTableRel} table-level relationship${otherTableRel === 1 ? '' : 's'}`,
    )
  }

  return { label, detailLines }
}
