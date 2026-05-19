import { slugify } from '@/lib/utils'
import { CONTRACT_ID_REGEX } from '@/lib/p1Constants'

/** Contract id derived from name — lowercase ASCII, hyphens only. */
export function deriveContractId(name: string): string {
  return slugify(name)
}

export function isValidContractId(id: string): boolean {
  return CONTRACT_ID_REGEX.test(id.trim())
}

/** Stable schema object id from physical name. */
export function stableSchemaId(physicalName: string): string {
  const base = slugify(physicalName.trim() || 'object')
  return base ? `tbl-${base}` : 'tbl-object'
}

/** Stable property id scoped to schema object. */
export function stablePropertyId(schemaId: string, physicalName: string): string {
  const col = slugify(physicalName.trim() || 'field').replace(/-/g, '_')
  const prefix = schemaId.replace(/-/g, '_')
  return `${prefix}_${col}_prop`
}
