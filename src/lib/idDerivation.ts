import { slugify } from '@/lib/utils'
import { CONTRACT_ID_REGEX } from '@/lib/p1Constants'

/** Hybrid contract id suffix: 8 lowercase hex chars. */
export const CONTRACT_ID_SUFFIX_PATTERN = /-[a-f0-9]{8}$/

/** Deterministic 8-char lowercase hex suffix from an ASCII seed (contract uid or name). */
export function contractIdSuffix(seed: string): string {
  let hash = 2166136261
  const normalized = seed.trim()
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(-8)
}

function contractNameSlug(name: string): string {
  const withoutAccents = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return slugify(withoutAccents) || 'contract'
}

/**
 * P1 contract id: `{slug-from-name}-{stable-suffix}`.
 * Suffix is derived from `contractSeed` (uid) when provided, otherwise from the name.
 */
export function deriveContractId(name: string, contractSeed?: string): string {
  const slug = contractNameSlug(name)
  const seed = contractSeed?.trim() || name.trim() || slug
  return `${slug}-${contractIdSuffix(seed)}`
}

export function isValidContractId(id: string): boolean {
  return CONTRACT_ID_REGEX.test(id.trim()) && CONTRACT_ID_SUFFIX_PATTERN.test(id.trim())
}

export function isHybridContractId(id: string): boolean {
  return isValidContractId(id)
}

/** Legacy P1 slug-only ids (no collision-reducing suffix). */
export function isLegacySlugOnlyContractId(id: string, name: string): boolean {
  const trimmed = id.trim()
  if (!trimmed || CONTRACT_ID_SUFFIX_PATTERN.test(trimmed)) return false
  return trimmed === contractNameSlug(name)
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
