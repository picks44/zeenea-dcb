import type { TableRelationship } from '@/types/odcs'
import { isCompositeTableRelationship } from '@/lib/relationshipExport'

export interface RelationshipDisplayLines {
  source: string
  target: string
  targetTable: string
  targetColumn?: string
}

/** Human-readable source/target lines for schema relationship UI. */
export function formatRelationshipDisplayLines(
  rel: TableRelationship,
  sourceTable: string,
): RelationshipDisplayLines | null {
  if (isCompositeTableRelationship(rel)) {
    const fromCols = rel.fromColumns ?? []
    const toCols = rel.toColumns ?? []
    if (fromCols.length === 0 || toCols.length === 0) return null
    return {
      source: fromCols.join(', '),
      target: toCols.map(c => `${rel.toTable}.${c}`).join(', '),
      targetTable: rel.toTable,
    }
  }
  if (rel.fromColumn && rel.toColumn) {
    return {
      source: `${sourceTable}.${rel.fromColumn}`,
      target: `${rel.toTable}.${rel.toColumn}`,
      targetTable: rel.toTable,
      targetColumn: rel.toColumn,
    }
  }
  if (rel.toTable) {
    return {
      source: sourceTable,
      target: rel.toTable,
      targetTable: rel.toTable,
    }
  }
  return null
}
