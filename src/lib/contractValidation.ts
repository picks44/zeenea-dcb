import { DataContract, OdcsAccessRole, SectionId, SlaProperty } from '@/types/odcs'
import {
  isAuthoritativeDefinitionComplete,
  isAuthoritativeDefinitionEmpty,
} from '@/lib/odcsSharedMappers'
import {
  isBelongsToRelationshipIncomplete,
  isExportedRelationshipType,
  type AuthoritativeDefinition,
} from '@/types/odcsShared'

/** Rows with no user-entered content are ignored for validation and export. */
export function isRoleRowEmpty(r: OdcsAccessRole): boolean {
  return !r.role?.trim() && !r.description?.trim()
}

export function isSlaRowEmpty(row: SlaProperty): boolean {
  return !row.value?.trim()
    && !row.unit?.trim()
    && !row.element?.trim()
    && !row.driver?.trim()
    && !row.description?.trim()
}

export interface ValidationIssue {
  code: string
  message: string
  severity: 'error' | 'warning'
  section?: SectionId
}

export interface ValidationResult {
  issues: ValidationIssue[]
  canPublish: boolean
  publishBlockReason: string | null
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

const SEMVER = /^\d+\.\d+\.\d+$/

function validateAuthoritativeDefinitions(
  issues: ValidationIssue[],
  defs: AuthoritativeDefinition[] | undefined,
  context: string,
  section: SectionId,
): void {
  for (const d of defs ?? []) {
    if (isAuthoritativeDefinitionEmpty(d)) continue
    if (!isAuthoritativeDefinitionComplete(d)) {
      issues.push({
        code: 'auth-def-incomplete',
        message: `${context}: each authoritative link needs a URL and type.`,
        severity: 'error',
        section,
      })
    }
  }
}

function validateQualityRules(
  issues: ValidationIssue[],
  rules: { id?: string; description?: string }[] | undefined,
  context: string,
): void {
  for (const q of rules ?? []) {
    if (!q.description?.trim()) {
      issues.push({
        code: 'quality-empty',
        message: `Quality rule on ${context} needs a description.`,
        severity: 'error',
        section: 'schema',
      })
    }
  }
}

export function validateContract(contract: DataContract): ValidationResult {
  const issues: ValidationIssue[] = []
  const { info, id, dataset } = contract

  if (!info.title.trim()) {
    issues.push({ code: 'title', message: 'Contract name is required.', severity: 'error', section: 'fundamentals' })
  }
  if (!id.trim()) {
    issues.push({ code: 'id', message: 'Contract ID is required.', severity: 'error', section: 'fundamentals' })
  }
  if (!info.owner.trim()) {
    issues.push({ code: 'owner', message: 'Contract owner is required.', severity: 'error', section: 'fundamentals' })
  }
  if (!SEMVER.test(info.version)) {
    issues.push({ code: 'version', message: 'Version must follow SemVer (e.g. 1.0.0).', severity: 'error', section: 'fundamentals' })
  }

  validateAuthoritativeDefinitions(
    issues,
    info.descriptionAuthoritativeDefinitions,
    'Contract description',
    'fundamentals',
  )

  if (dataset.length === 0) {
    issues.push({ code: 'schema', message: 'At least one table is required in the schema.', severity: 'error', section: 'schema' })
  }

  for (const table of dataset) {
    if (table.columns.length === 0) {
      issues.push({
        code: 'schema-empty-table',
        message: `Table "${table.physicalName}" has no fields.`,
        severity: 'error',
        section: 'schema',
      })
    }

    const names = new Map<string, number>()
    for (const col of table.columns) {
      const key = col.physicalName.trim().toLowerCase()
      if (!key) continue
      names.set(key, (names.get(key) ?? 0) + 1)
    }
    for (const [name, count] of names) {
      if (count > 1) {
        issues.push({
          code: 'duplicate-column',
          message: `Duplicate field name "${name}" in table "${table.physicalName}".`,
          severity: 'error',
          section: 'schema',
        })
      }
    }

    const pkCols = table.columns.filter(c => c.isPrimaryKey)
    if (pkCols.length > 0) {
      const positions: number[] = []
      let idx = 0
      for (const col of table.columns) {
        if (col.isPrimaryKey) positions.push(++idx)
      }
      const expected = Array.from({ length: pkCols.length }, (_, i) => i + 1)
      const sorted = [...positions].sort((a, b) => a - b)
      if (sorted.join(',') !== expected.join(',') || new Set(sorted).size !== sorted.length) {
        issues.push({
          code: 'pk-positions',
          message: `Primary key positions must be unique and consecutive in table "${table.physicalName}".`,
          severity: 'error',
          section: 'schema',
        })
      }
    }

    for (const col of table.columns) {
      validateQualityRules(issues, col.quality, `"${col.physicalName}"`)
      validateAuthoritativeDefinitions(
        issues,
        col.authoritativeDefinitions,
        `Field "${col.physicalName}"`,
        'schema',
      )
    }

    validateQualityRules(issues, table.quality, `table "${table.physicalName}"`)
    validateAuthoritativeDefinitions(
      issues,
      table.authoritativeDefinitions,
      `Table "${table.physicalName}"`,
      'schema',
    )

    for (const rel of table.relationships ?? []) {
      if (!isExportedRelationshipType(rel.type)) {
        issues.push({
          code: 'relationship-not-exported',
          message: `Relationship "${rel.type}" on "${table.physicalName}" is not exported to ODCS YAML (legacy type).`,
          severity: 'warning',
          section: 'schema',
        })
      } else if (isBelongsToRelationshipIncomplete(rel)) {
        issues.push({
          code: 'relationship-incomplete-fk',
          message: `Relationship from ${table.physicalName} to ${rel.toTable} will not be exported to ODCS YAML until join columns are configured.`,
          severity: 'warning',
          section: 'schema',
        })
      }
    }
  }

  for (const row of contract.slaProperties ?? []) {
    if (isSlaRowEmpty(row)) continue
    if (!row.property?.trim() || !row.value?.trim()) {
      issues.push({
        code: 'sla-incomplete',
        message: 'Each SLA row needs a property and value.',
        severity: 'error',
        section: 'sla',
      })
    }
  }

  for (const r of contract.roles ?? []) {
    if (isRoleRowEmpty(r)) continue
    if (!r.role?.trim() || !r.access) {
      issues.push({
        code: 'role-incomplete',
        message: 'Each data access role needs a role name and access level.',
        severity: 'error',
        section: 'accessRoles',
      })
    }
  }

  const piiCount = dataset.reduce((a, t) => a + t.columns.filter(c => c.isPII).length, 0)
  if (piiCount > 0 && contract.stakeholders.length === 0) {
    issues.push({
      code: 'pii-stakeholders',
      message: `${piiCount} PII field(s) detected — add stakeholders for governance contact (not exported to YAML).`,
      severity: 'warning',
      section: 'stakeholders',
    })
  }

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const canPublish = errors.length === 0
  const publishBlockReason = canPublish ? null : errors[0].message

  return { issues, canPublish, publishBlockReason, errors, warnings }
}
