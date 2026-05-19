import type { DataContract, QualityRule, SlaProperty, ColumnDefinition, SchemaTable } from '@/types/odcs'
import type { AuthoritativeDefinition, CustomProperty } from '@/types/odcsShared'
import {
  CUSTOM_PROPERTY_REGEX,
  FUNDAMENTALS_AUTH_DEF_TYPES,
  LIFECYCLE_STATUSES,
  QUALITY_DIMENSIONS,
  SLA_DRIVERS,
  SLA_ELEMENT_SEGMENT_REGEX,
  SLA_PROPERTY_TYPES,
  SLA_UNITS,
  ZEENEA_AUTH_DEF_TYPE,
  ZEENEA_ACTIAN_URL_PATTERN,
} from '@/lib/p1Constants'
import { deriveContractId, isValidContractId } from '@/lib/idDerivation'
import { findZeeneaCatalogItemByUrl } from '@/lib/zeeneaCatalog'

export function isValidP1ContractId(id: string): boolean {
  return isValidContractId(id)
}

export function contractIdMatchesName(contract: DataContract): boolean {
  const expected = deriveContractId(contract.info.title, contract.uid)
  return contract.id.trim() === expected
}

export function isDuplicateContractId(id: string, allContracts: DataContract[], excludeUid?: string): boolean {
  const key = id.trim()
  if (!key) return false
  return allContracts.some(c => c.uid !== excludeUid && c.id.trim() === key)
}

export function collectSchemaIds(dataset: SchemaTable[]): string[] {
  return dataset.map(t => t.id.trim()).filter(Boolean)
}

export function collectPropertyIds(dataset: SchemaTable[]): string[] {
  return dataset.flatMap(t => t.columns.map(c => c.id.trim()).filter(Boolean))
}

export function hasDuplicateIds(ids: string[]): string | null {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) return id
    seen.add(id)
  }
  return null
}

export function isValidFundamentalsAuthDefType(type: string): boolean {
  return (FUNDAMENTALS_AUTH_DEF_TYPES as readonly string[]).includes(type)
}

export function isValidZeeneaAuthDef(def: AuthoritativeDefinition): boolean {
  if (def.type.trim() !== ZEENEA_AUTH_DEF_TYPE) return false
  const url = def.url?.trim()
  if (!url) return false
  return Boolean(findZeeneaCatalogItemByUrl(url) || ZEENEA_ACTIAN_URL_PATTERN.test(url))
}

export function isValidSlaUnit(unit: string): boolean {
  return (SLA_UNITS as readonly string[]).includes(unit.trim())
}

export function isValidSlaDriver(driver: string): boolean {
  return (SLA_DRIVERS as readonly string[]).includes(driver.trim())
}

export function isValidSlaPropertyType(property: string): boolean {
  return (SLA_PROPERTY_TYPES as readonly string[]).includes(property.trim())
}

export function isValidSlaElement(element: string): boolean {
  const parts = element.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) return false
  return parts.every(p => SLA_ELEMENT_SEGMENT_REGEX.test(p))
}

export function isValidCustomPropertyName(property: string): boolean {
  return CUSTOM_PROPERTY_REGEX.test(property.trim())
}

export function isQualityRuleContentEmpty(rule: QualityRule): boolean {
  return !rule.description?.trim() && !rule.name?.trim()
}

export function qualityRuleNeedsDimension(rule: QualityRule): boolean {
  return Boolean(rule.description?.trim() || rule.name?.trim())
}

export function isValidQualityDimension(dimension: string): boolean {
  return (QUALITY_DIMENSIONS as readonly string[]).includes(dimension.trim())
}

/** P1 MVP: only natural-language text rules are allowed at publish time. */
export function isValidQualityRuleType(type: string | undefined): boolean {
  return type === 'text'
}

export function isValidRoleAccess(access: string): boolean {
  return access === 'read' || access === 'write'
}

export function isValidLifecycleStatus(status: string): boolean {
  return (LIFECYCLE_STATUSES as readonly string[]).includes(status)
}

export function arrayPropertyNeedsItems(col: ColumnDefinition): boolean {
  return col.logicalType === 'array'
}

export function isValidArrayItems(col: ColumnDefinition): boolean {
  if (!arrayPropertyNeedsItems(col)) return true
  if (!col.items) return false
  if (col.items.logicalType === 'string') return true
  if (col.items.logicalType === 'object') {
    return (col.items.properties?.length ?? 0) > 0
  }
  return false
}

export function slaRowHasContent(row: SlaProperty): boolean {
  return Boolean(
    row.property
    || row.value?.trim()
    || row.unit?.trim()
    || row.element?.trim()
    || row.driver?.trim()
    || row.description?.trim(),
  )
}

export function customPropertyRowHasContent(row: CustomProperty): boolean {
  return Boolean(row.property?.trim() || row.value?.trim() || row.description?.trim())
}
