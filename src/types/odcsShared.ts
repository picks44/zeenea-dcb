export interface AuthoritativeDefinition {
  id: string
  url: string
  type: string
  description?: string
}

export interface CustomProperty {
  id: string
  property: string
  value: string
  description?: string
}

export {
  FUNDAMENTALS_AUTH_DEF_TYPES,
  FUNDAMENTALS_AUTH_DEF_LABELS,
  ZEENEA_AUTH_DEF_TYPE,
  SHARED_AUTH_DEF_TYPES,
  QUALITY_DIMENSIONS,
  SLA_UNITS,
  SLA_DRIVERS,
} from '@/lib/p1Constants'

export type {
  FundamentalsAuthDefType,
  SharedAuthDefType,
  SlaUnit,
  SlaDriver,
} from '@/lib/p1Constants'

export const EXPORTED_RELATIONSHIP_TYPES = [
  'belongs_to',
  'many_to_many',
  'composite_foreign_key',
] as const

export type ExportedRelationshipType = (typeof EXPORTED_RELATIONSHIP_TYPES)[number]

export function isExportedRelationshipType(type: string): boolean {
  return EXPORTED_RELATIONSHIP_TYPES.includes(type as ExportedRelationshipType)
}

/** @deprecated Use relationshipExport helpers — kept for imports during migration. */
export function isBelongsToRelationshipIncomplete(rel: {
  type: string
  toTable?: string
  fromColumn?: string
  toColumn?: string
  fromColumns?: string[]
  toColumns?: string[]
}): boolean {
  if (rel.type === 'composite_foreign_key') {
    const from = (rel.fromColumns ?? []).filter(c => c.trim())
    const to = (rel.toColumns ?? []).filter(c => c.trim())
    return from.length < 2 || to.length < 2 || from.length !== to.length || !rel.toTable?.trim()
  }
  return rel.type === 'belongs_to'
    && (!rel.fromColumn?.trim() || !rel.toColumn?.trim())
}
