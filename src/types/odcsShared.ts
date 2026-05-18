/** Re-export core quality type from domain model. */
export type { QualityRule } from './odcs'

export interface AuthoritativeDefinition {
  id: string
  url: string
  type: string
  description?: string
}

export interface CustomProperty {
  property: string
  value: string
  description?: string
}

export const AUTH_DEF_TYPE_OPTIONS = [
  'businessDefinition',
  'implementation',
  'documentation',
  'actian',
  'videoTutorial',
] as const

export const EXPORTED_RELATIONSHIP_TYPES = ['belongs_to', 'many_to_many'] as const

export type ExportedRelationshipType = (typeof EXPORTED_RELATIONSHIP_TYPES)[number]

export function isExportedRelationshipType(type: string): boolean {
  return EXPORTED_RELATIONSHIP_TYPES.includes(type as ExportedRelationshipType)
}

/** `belongs_to` needs join columns to export as ODCS foreignKey. */
export function isBelongsToRelationshipIncomplete(rel: {
  type: string
  fromColumn?: string
  toColumn?: string
}): boolean {
  return rel.type === 'belongs_to'
    && (!rel.fromColumn?.trim() || !rel.toColumn?.trim())
}
