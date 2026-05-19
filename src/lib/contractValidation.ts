import { DataContract, OdcsAccessRole, SectionId, SlaProperty } from '@/types/odcs'
import {
  isAuthoritativeDefinitionComplete,
  isAuthoritativeDefinitionEmpty,
} from '@/lib/odcsSharedMappers'
import { countAssignedStakeholders } from '@/lib/stakeholders'
import {
  isExportedRelationshipType,
  type AuthoritativeDefinition,
} from '@/types/odcsShared'
import {
  isColumnForeignKeyPartial,
  isCompositeRelationshipIncomplete,
  isCompositeTableRelationship,
  isLegacyBelongsToIncomplete,
  isLegacySingleColumnBelongsTo,
} from '@/lib/relationshipExport'
import {
  arrayPropertyNeedsItems,
  collectPropertyIds,
  collectSchemaIds,
  contractIdMatchesName,
  customPropertyRowHasContent,
  hasDuplicateIds,
  isDuplicateContractId,
  isQualityRuleContentEmpty,
  isValidArrayItems,
  isValidCustomPropertyName,
  isValidFundamentalsAuthDefType,
  isValidLifecycleStatus,
  isValidP1ContractId,
  isValidQualityDimension,
  isValidQualityRuleType,
  isValidRoleAccess,
  isValidSlaDriver,
  isValidSlaElement,
  isValidSlaUnit,
  isValidZeeneaAuthDef,
  qualityRuleNeedsDimension,
  slaRowHasContent,
} from '@/lib/p1Validation'
import { canPublishFromStatus } from '@/lib/contractLifecycle'

/** Rows with no user-entered content are ignored for validation and export. */
export function isRoleRowEmpty(r: OdcsAccessRole): boolean {
  return !r.role?.trim() && !r.description?.trim()
}

export function isSlaRowEmpty(row: SlaProperty): boolean {
  return !slaRowHasContent(row)
}

export interface ValidationIssue {
  code: string
  message: string
  severity: 'error' | 'warning'
  section?: SectionId
  fieldId?: string
}

export interface ValidationResult {
  issues: ValidationIssue[]
  canPublish: boolean
  publishBlockReason: string | null
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

const SEMVER = /^\d+\.\d+\.\d+$/

function validateFundamentalsAuthDefs(
  issues: ValidationIssue[],
  defs: AuthoritativeDefinition[] | undefined,
): void {
  for (const d of defs ?? []) {
    if (isAuthoritativeDefinitionEmpty(d)) continue
    if (!isAuthoritativeDefinitionComplete(d)) {
      issues.push({
        code: 'auth-def-incomplete',
        message: 'Contract description reference: URL and type are required.',
        severity: 'error',
        section: 'fundamentals',
      })
      continue
    }
    if (!isValidFundamentalsAuthDefType(d.type)) {
      issues.push({
        code: 'auth-def-fundamentals-type',
        message: 'Contract description reference type must be privacyStatement, termsAndConditions, or licenseAgreement.',
        severity: 'error',
        section: 'fundamentals',
      })
    }
  }
}

function validateZeeneaAuthDefs(
  issues: ValidationIssue[],
  defs: AuthoritativeDefinition[] | undefined,
  context: string,
): void {
  for (const d of defs ?? []) {
    if (isAuthoritativeDefinitionEmpty(d)) continue
    if (!isAuthoritativeDefinitionComplete(d)) {
      issues.push({
        code: 'auth-def-incomplete',
        message: `${context}: URL and type are required.`,
        severity: 'error',
        section: 'schema',
      })
      continue
    }
    if (!isValidZeeneaAuthDef(d)) {
      issues.push({
        code: 'auth-def-zeenea',
        message: `${context}: only Zeenea catalog links with type "actian" are allowed.`,
        severity: 'error',
        section: 'schema',
      })
    }
  }
}

function validateQualityRules(
  issues: ValidationIssue[],
  rules: DataContract['dataset'][0]['quality'],
  context: string,
  requireAiVerified: boolean,
): void {
  for (const q of rules ?? []) {
    if (isQualityRuleContentEmpty(q)) continue
    if (!isValidQualityRuleType(q.type)) {
      issues.push({
        code: 'quality-type-invalid',
        message: `Quality rule on ${context} must use type "text" (P1 MVP).`,
        severity: 'error',
        section: 'schema',
      })
    }
    if (!q.description?.trim()) {
      issues.push({
        code: 'quality-empty',
        message: `Quality rule on ${context} needs a description.`,
        severity: 'error',
        section: 'schema',
      })
    }
    if (qualityRuleNeedsDimension(q) && !q.dimension) {
      issues.push({
        code: 'quality-dimension',
        message: `Quality rule on ${context} needs a dimension.`,
        severity: 'error',
        section: 'schema',
      })
    } else if (q.dimension && !isValidQualityDimension(q.dimension)) {
      issues.push({
        code: 'quality-dimension-invalid',
        message: `Quality rule on ${context} has an invalid dimension.`,
        severity: 'error',
        section: 'schema',
      })
    }
    if (requireAiVerified && !q.aiVerified) {
      issues.push({
        code: 'quality-ai-unverified',
        message: `Quality rule on ${context} must be verified by AI before publishing.`,
        severity: 'error',
        section: 'schema',
      })
    }
  }
}

export function validateContract(
  contract: DataContract,
  allContracts: DataContract[] = [],
): ValidationResult {
  const issues: ValidationIssue[] = []
  const { info, id, dataset } = contract

  if (!info.title.trim()) {
    issues.push({
      code: 'title',
      message: 'Contract name is required.',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-title',
    })
  }
  if (!id.trim()) {
    issues.push({
      code: 'id',
      message: 'Contract ID is required.',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-id',
    })
  } else if (!isValidP1ContractId(id)) {
    issues.push({
      code: 'id-format',
      message: 'Contract ID must be lowercase ASCII with hyphens only.',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-id',
    })
  } else if (info.title.trim() && !contractIdMatchesName(contract)) {
    issues.push({
      code: 'id-derived',
      message: 'Contract ID must match the name (auto-derived slug).',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-id',
    })
  } else if (isDuplicateContractId(id, allContracts, contract.uid)) {
    issues.push({
      code: 'id-duplicate',
      message: 'Contract ID must be unique in the registry.',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-id',
    })
  }

  if (!info.owner.trim()) {
    issues.push({
      code: 'owner',
      message: 'Business owner required before publishing.',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-owner',
    })
  }
  if (!SEMVER.test(info.version)) {
    issues.push({
      code: 'version',
      message: 'Version must follow SemVer (e.g. 1.0.0).',
      severity: 'error',
      section: 'fundamentals',
      fieldId: 'contract-version',
    })
  }

  if (!isValidLifecycleStatus(info.status)) {
    issues.push({
      code: 'status-invalid',
      message: 'Contract status must be a valid ODCS lifecycle value.',
      severity: 'error',
      section: 'fundamentals',
    })
  }

  if (info.status === 'proposed') {
    issues.push({
      code: 'status-proposed',
      message: 'Start drafting before publishing.',
      severity: 'error',
      section: 'fundamentals',
    })
  }

  validateFundamentalsAuthDefs(issues, info.descriptionAuthoritativeDefinitions)

  const dupSchema = hasDuplicateIds(collectSchemaIds(dataset))
  if (dupSchema) {
    issues.push({
      code: 'schema-id-duplicate',
      message: `Duplicate schema id "${dupSchema}" in this contract.`,
      severity: 'error',
      section: 'schema',
    })
  }

  const dupProp = hasDuplicateIds(collectPropertyIds(dataset))
  if (dupProp) {
    issues.push({
      code: 'property-id-duplicate',
      message: `Duplicate property id "${dupProp}" in this contract.`,
      severity: 'error',
      section: 'schema',
    })
  }

  for (const cp of contract.customProperties ?? []) {
    if (!customPropertyRowHasContent(cp)) continue
    if (!cp.property?.trim() || !cp.value?.trim()) {
      issues.push({
        code: 'custom-incomplete',
        message: 'Each custom property needs a name and value.',
        severity: 'error',
        section: 'custom',
      })
    } else if (!isValidCustomPropertyName(cp.property)) {
      issues.push({
        code: 'custom-property-format',
        message: `Custom property "${cp.property}" must be camelCase.`,
        severity: 'error',
        section: 'custom',
      })
    }
  }

  if (dataset.length === 0) {
    issues.push({
      code: 'schema',
      message: 'At least one table is required in the schema.',
      severity: 'error',
      section: 'schema',
      fieldId: 'schema-root',
    })
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
      validateQualityRules(issues, col.quality, `"${col.physicalName}"`, false)
      validateZeeneaAuthDefs(issues, col.authoritativeDefinitions, `Field "${col.physicalName}"`)
      if (isColumnForeignKeyPartial(col.foreignKey)) {
        issues.push({
          code: 'column-fk-incomplete',
          message: `Field "${col.physicalName}" on "${table.physicalName}": referenced table and field are required to publish a foreign key.`,
          severity: 'error',
          section: 'schema',
        })
      }
      if (arrayPropertyNeedsItems(col) && !isValidArrayItems(col)) {
        issues.push({
          code: 'array-items',
          message: `Field "${col.physicalName}" is an array and requires items configuration.`,
          severity: 'error',
          section: 'schema',
        })
      }
    }

    validateQualityRules(issues, table.quality, `table "${table.physicalName}"`, true)
    validateZeeneaAuthDefs(issues, table.authoritativeDefinitions, `Table "${table.physicalName}"`)

    for (const rel of table.relationships ?? []) {
      if (!isExportedRelationshipType(rel.type)) {
        issues.push({
          code: 'relationship-not-exported',
          message: `Relationship "${rel.type}" on "${table.physicalName}" uses a legacy type (not published to ODCS YAML).`,
          severity: 'warning',
          section: 'schema',
        })
      } else if (isLegacySingleColumnBelongsTo(rel) && isLegacyBelongsToIncomplete(rel)) {
        issues.push({
          code: 'relationship-incomplete-fk',
          message: `Relationship on "${table.physicalName}" is incomplete — configure it on the field properties or complete join columns.`,
          severity: 'warning',
          section: 'schema',
        })
      } else if (
        (rel.type === 'composite_foreign_key' || isCompositeTableRelationship(rel))
        && isCompositeRelationshipIncomplete(rel)
      ) {
        issues.push({
          code: 'composite-fk-incomplete',
          message: `Composite foreign key on "${table.physicalName}" needs at least two source and referenced columns.`,
          severity: 'warning',
          section: 'schema',
        })
      }
    }
  }

  for (const row of contract.slaProperties ?? []) {
    if (isSlaRowEmpty(row)) continue
    if (!row.value?.trim()) {
      issues.push({
        code: 'sla-value-required',
        message: 'Each SLA row needs a value.',
        severity: 'error',
        section: 'sla',
      })
    }
    if (row.unit?.trim() && !isValidSlaUnit(row.unit)) {
      issues.push({
        code: 'sla-unit-invalid',
        message: 'SLA unit must be one of: d, day, days, y, yr, years, h, hr, hours.',
        severity: 'error',
        section: 'sla',
      })
    }
    if (row.driver?.trim() && !isValidSlaDriver(row.driver)) {
      issues.push({
        code: 'sla-driver-invalid',
        message: 'SLA driver must be regulatory, analytics, or operational.',
        severity: 'error',
        section: 'sla',
      })
    }
    if (row.element?.trim() && !isValidSlaElement(row.element)) {
      issues.push({
        code: 'sla-element-invalid',
        message: 'SLA element must use Object.Property notation (comma-separated for multiple).',
        severity: 'error',
        section: 'sla',
      })
    }
  }

  for (const r of contract.roles ?? []) {
    if (isRoleRowEmpty(r)) continue
    if (!r.role?.trim()) {
      issues.push({
        code: 'role-incomplete',
        message: 'Each data access role needs a role name.',
        severity: 'error',
        section: 'accessRoles',
      })
    }
    if (!r.access) {
      issues.push({
        code: 'role-access',
        message: 'Each data access role needs an access level.',
        severity: 'error',
        section: 'accessRoles',
      })
    } else if (!isValidRoleAccess(r.access)) {
      issues.push({
        code: 'role-access-invalid',
        message: 'Data access role access must be read or write.',
        severity: 'error',
        section: 'accessRoles',
      })
    }
  }

  const piiCount = dataset.reduce((a, t) => a + t.columns.filter(c => c.isPII).length, 0)
  if (piiCount > 0 && countAssignedStakeholders(contract.stakeholders) === 0) {
    issues.push({
      code: 'pii-stakeholders',
      message: `${piiCount} PII field(s) detected — add governance contacts teams can reach for privacy questions.`,
      severity: 'warning',
      section: 'stakeholders',
    })
  }

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const publishStatusOk = canPublishFromStatus(info.status, contract.inRevision)
  const canPublish = errors.length === 0 && publishStatusOk
  const publishBlockReason = canPublish
    ? null
    : !publishStatusOk
      ? 'Contract must be in draft (or in revision) before publishing.'
      : errors[0].message

  return { issues, canPublish, publishBlockReason, errors, warnings }
}
