import type { ColumnDefinition, LogicalType, SchemaTable } from '@/types/odcs'
import {
  APP_ONLY_LOGICAL_TYPES,
  CLASSIFICATION_VALUES,
  ODCS_LOGICAL_TYPES,
  SCHEMA_PHYSICAL_TYPES,
  type ClassificationValue,
  type OdcsLogicalType,
  type SchemaPhysicalType,
} from '@/lib/p1Constants'
import { slugify } from '@/lib/utils'

/** Normalize a source identifier into an ODCS `name` (lowercase ASCII, underscores). */
export function normalizeOdcsName(source: string): string {
  const trimmed = source.trim()
  if (!trimmed) return 'field'
  const slug = slugify(trimmed.replace(/_/g, '-'))
  if (slug) return slug.replace(/-/g, '_')
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'field'
}

export function isValidOdcsLogicalType(value: string): value is OdcsLogicalType {
  return (ODCS_LOGICAL_TYPES as readonly string[]).includes(value)
}

export function isAppOnlyLogicalType(value: string): boolean {
  return (APP_ONLY_LOGICAL_TYPES as readonly string[]).includes(value)
}

export function isValidClassification(value: string): value is ClassificationValue {
  return (CLASSIFICATION_VALUES as readonly string[]).includes(value)
}

export function isValidSchemaPhysicalType(value: string): value is SchemaPhysicalType {
  return (SCHEMA_PHYSICAL_TYPES as readonly string[]).includes(value)
}

/** Resolve tableType / physicalType to a valid ODCS physicalType. */
export function resolveSchemaPhysicalType(table: SchemaTable): SchemaPhysicalType {
  const raw = table.physicalType ?? table.tableType ?? 'table'
  if (isValidSchemaPhysicalType(raw)) return raw
  if (raw === 'table' || raw === 'view') return raw
  return 'table'
}

export function resolveTableName(table: SchemaTable): string {
  return table.name?.trim() || normalizeOdcsName(table.physicalName)
}

export function resolveTableBusinessName(table: SchemaTable): string | undefined {
  const q = table.quantumName?.trim()
  if (q) return q
  return undefined
}

export function resolvePropertyName(col: ColumnDefinition): string {
  return col.name?.trim() || normalizeOdcsName(col.physicalName)
}

export function resolvePropertyBusinessName(col: ColumnDefinition): string | undefined {
  const label = col.logicalName?.trim()
  if (label) return label
  return undefined
}

/** Classification for export; omit public and unset. isPII is not exported. */
export function resolvePropertyClassification(
  col: ColumnDefinition,
): ClassificationValue | undefined {
  if (col.classification && col.classification !== 'public') {
    return col.classification
  }
  if (col.isPII) return 'confidential'
  return undefined
}

/** Sync app PII flag from classification (UI bidirectional sync). */
export function classificationImpliesPii(classification: ClassificationValue | undefined): boolean {
  return classification === 'confidential'
}

export function syncClassificationFromPii(
  isPII: boolean,
  current?: ClassificationValue,
): ClassificationValue | undefined {
  if (isPII) return 'confidential'
  if (current === 'confidential') return undefined
  return current
}

export interface ResolvedTableOdcsFields {
  name: string
  physicalName: string
  physicalType: SchemaPhysicalType
  businessName?: string
}

export interface ResolvedPropertyOdcsFields {
  name: string
  physicalName: string
  logicalType: LogicalType
  primaryKey: boolean
  unique: boolean
  criticalDataElement: boolean
  classification?: ClassificationValue
  businessName?: string
}

export function resolveTableOdcsFields(table: SchemaTable): ResolvedTableOdcsFields {
  const physicalName = table.physicalName.trim()
  const out: ResolvedTableOdcsFields = {
    name: resolveTableName(table),
    physicalName,
    physicalType: resolveSchemaPhysicalType(table),
  }
  const businessName = resolveTableBusinessName(table)
  if (businessName) out.businessName = businessName
  return out
}

export function resolvePropertyOdcsFields(col: ColumnDefinition): ResolvedPropertyOdcsFields {
  const physicalName = col.physicalName.trim()
  const out: ResolvedPropertyOdcsFields = {
    name: resolvePropertyName(col),
    physicalName,
    logicalType: col.logicalType,
    primaryKey: col.isPrimaryKey,
    unique: col.isUnique,
    criticalDataElement: col.criticalDataElement ?? false,
  }
  const classification = resolvePropertyClassification(col)
  if (classification) out.classification = classification
  const businessName = resolvePropertyBusinessName(col)
  if (businessName) out.businessName = businessName
  return out
}

/** Apply ODCS omit-if-false for boolean export fields. */
export function applyPropertyBooleanExportFlags(
  target: Record<string, unknown>,
  resolved: ResolvedPropertyOdcsFields,
): void {
  if (resolved.primaryKey) target.primaryKey = true
  if (resolved.unique) target.unique = true
  if (resolved.criticalDataElement) target.criticalDataElement = true
  if (resolved.classification) target.classification = resolved.classification
}

export function migrateTableOdcsFields(table: SchemaTable): SchemaTable {
  const physicalType = resolveSchemaPhysicalType(table)
  const tableType = isValidSchemaPhysicalType(table.tableType ?? '')
    ? table.tableType
    : physicalType === 'topic' || physicalType === 'file'
      ? physicalType
      : (physicalType as 'table' | 'view')

  return {
    ...table,
    name: table.name?.trim() || normalizeOdcsName(table.physicalName),
    physicalType,
    tableType: tableType as SchemaTable['tableType'],
    quantumName: table.quantumName?.trim() || table.physicalName,
    columns: (table.columns ?? []).map(c => migrateColumnOdcsFields(c)),
  }
}

export function migrateColumnOdcsFields(col: ColumnDefinition): ColumnDefinition {
  const classification =
    col.classification
    ?? (col.isPII ? 'confidential' as const : undefined)

  return {
    ...col,
    name: col.name?.trim() || normalizeOdcsName(col.physicalName),
    classification,
    criticalDataElement: col.criticalDataElement ?? false,
    isPII: col.isPII ?? classificationImpliesPii(classification),
  }
}
