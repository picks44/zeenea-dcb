import type { DataContract, SectionId } from '@/types/odcs'
import { validateContract, type ValidationIssue, type ValidationResult } from '@/lib/contractValidation'
import { countAssignedStakeholders } from '@/lib/stakeholders'
import {
  READINESS_FIELD_ACCESS_ROLES_ROOT,
  READINESS_FIELD_CONTRACT_DOMAIN,
  READINESS_FIELD_CONTRACT_PURPOSE,
  READINESS_FIELD_FUNDAMENTALS_REF_LINKS,
  READINESS_FIELD_STAKEHOLDERS_ROOT,
} from '@/lib/readinessAnchors'
import {
  READINESS_FIELD_CONTRACT_ID,
  READINESS_FIELD_CONTRACT_OWNER,
  READINESS_FIELD_CONTRACT_TITLE,
  READINESS_FIELD_CONTRACT_VERSION,
  READINESS_FIELD_SCHEMA_ROOT,
  READINESS_HELPER_CONTRACT_NAME,
  READINESS_HELPER_CONTRACT_ID,
  READINESS_HELPER_CONTRACT_OWNER,
  READINESS_HELPER_CONTRACT_VERSION,
  READINESS_HELPER_SCHEMA_FIELDS,
  READINESS_GUIDANCE_FUNDAMENTALS_BANNER,
  READINESS_GUIDANCE_SCHEMA_BANNER,
  READINESS_GUIDANCE_STAKEHOLDERS_BANNER,
  READINESS_PANEL_LABEL_CONTACTS,
  READINESS_PANEL_LABEL_DATA_ACCESS,
  READINESS_PANEL_LABEL_DOMAIN,
  READINESS_PANEL_LABEL_PURPOSE,
  READINESS_PANEL_LABEL_REF_LINKS,
} from '@/lib/uxCopy'

export type ReadinessFieldId = string

export type SectionGuidanceStatus = 'complete' | 'incomplete' | 'empty'

export interface SectionGuidanceInfo {
  status: SectionGuidanceStatus
  missingCount: number
  bannerMessage: string | null
  bannerVariant: 'required' | 'recommended' | null
}

export interface ReadinessGuidanceItem {
  key: string
  label: string
  ok: boolean
  variant: 'required' | 'recommended'
  section: SectionId
  fieldId?: ReadinessFieldId
  /** Form emphasis only — not shown in readiness panel rows. */
  missingHelper?: string
  badge?: string
}

const SEMVER = /^\d+\.\d+\.\d+$/

function fundamentalsMissingCount(contract: DataContract, validation: ValidationResult): number {
  const { info, id } = contract
  let n = 0
  if (!info.title.trim()) n++
  if (!id.trim()) n++
  if (!info.owner.trim()) n++
  if (!SEMVER.test(info.version)) n++
  n += validation.errors.filter(
    e => e.section === 'fundamentals' && e.code === 'auth-def-incomplete',
  ).length
  return n
}

function schemaMissingCount(contract: DataContract, validation: ValidationResult): number {
  const fieldCount = contract.dataset.reduce((acc, t) => acc + t.columns.length, 0)
  const schemaErrors = validation.errors.filter(e => e.section === 'schema')
  if (fieldCount === 0) return 1
  return schemaErrors.length > 0 ? schemaErrors.length : 0
}

function hasFundamentalsContent(contract: DataContract): boolean {
  const { info, id } = contract
  return Boolean(
    info.title.trim()
    || id.trim()
    || info.owner.trim()
    || info.domain.trim()
    || info.description.trim(),
  )
}

function hasSchemaContent(contract: DataContract): boolean {
  return contract.dataset.length > 0
}

function hasReferenceLinks(contract: DataContract): boolean {
  const defs = contract.info.descriptionAuthoritativeDefinitions ?? []
  return defs.some(d => d.url.trim() || d.type.trim() || (d.description ?? '').trim())
}

/** At least one consumer role with name and access level (ODCS data access). */
export function hasExploitableDataAccessRole(contract: DataContract): boolean {
  return (contract.roles ?? []).some(
    r => Boolean(r.role?.trim()) && Boolean(r.access),
  )
}

export function computeSectionGuidance(
  contract: DataContract,
  validation?: ValidationResult,
  allContracts?: DataContract[],
): Partial<Record<SectionId, SectionGuidanceInfo>> {
  const v = validation ?? validateContract(contract, allContracts)
  const piiCount = contract.dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.isPII).length,
    0,
  )
  const contactCount = countAssignedStakeholders(contract.stakeholders)
  const fieldCount = contract.dataset.reduce((acc, t) => acc + t.columns.length, 0)

  const fundMissing = fundamentalsMissingCount(contract, v)
  const schemaMissing = schemaMissingCount(contract, v)

  const fundamentals: SectionGuidanceInfo = fundMissing > 0
    ? {
        status: 'incomplete',
        missingCount: fundMissing,
        bannerMessage: READINESS_GUIDANCE_FUNDAMENTALS_BANNER,
        bannerVariant: 'required',
      }
    : hasFundamentalsContent(contract)
      ? { status: 'complete', missingCount: 0, bannerMessage: null, bannerVariant: null }
      : { status: 'empty', missingCount: 0, bannerMessage: null, bannerVariant: null }

  const schema: SectionGuidanceInfo = schemaMissing > 0
    ? {
        status: 'incomplete',
        missingCount: schemaMissing,
        bannerMessage: READINESS_GUIDANCE_SCHEMA_BANNER,
        bannerVariant: 'required',
      }
    : hasSchemaContent(contract) && fieldCount > 0
      ? { status: 'complete', missingCount: 0, bannerMessage: null, bannerVariant: null }
      : hasSchemaContent(contract)
        ? { status: 'incomplete', missingCount: 1, bannerMessage: READINESS_GUIDANCE_SCHEMA_BANNER, bannerVariant: 'required' }
        : { status: 'empty', missingCount: 0, bannerMessage: null, bannerVariant: null }

  const stakeholders: SectionGuidanceInfo = contactCount > 0
    ? { status: 'complete', missingCount: 0, bannerMessage: null, bannerVariant: null }
    : piiCount > 0 && fieldCount > 0
      ? {
          status: 'empty',
          missingCount: 0,
          bannerMessage: READINESS_GUIDANCE_STAKEHOLDERS_BANNER,
          bannerVariant: 'recommended',
        }
      : { status: 'empty', missingCount: 0, bannerMessage: null, bannerVariant: null }

  const accessRoles = (contract.roles?.length ?? 0) > 0
    ? { status: 'complete' as const, missingCount: 0, bannerMessage: null, bannerVariant: null }
    : { status: 'empty' as const, missingCount: 0, bannerMessage: null, bannerVariant: null }

  const sla = (contract.slaProperties?.length ?? 0) > 0
    ? { status: 'complete' as const, missingCount: 0, bannerMessage: null, bannerVariant: null }
    : { status: 'empty' as const, missingCount: 0, bannerMessage: null, bannerVariant: null }

  return {
    fundamentals,
    schema,
    stakeholders,
    accessRoles,
    sla,
  }
}

export function buildReadinessGuidanceItems(
  contract: DataContract,
  allContracts?: DataContract[],
): ReadinessGuidanceItem[] {
  const validation = validateContract(contract, allContracts)
  const { info, id } = contract
  const fieldCount = contract.dataset.reduce((acc, t) => acc + t.columns.length, 0)
  const schemaOk = !validation.errors.some(e => e.section === 'schema') && fieldCount > 0
  const contactCount = countAssignedStakeholders(contract.stakeholders)

  const required: ReadinessGuidanceItem[] = [
    {
      key: 'title',
      label: 'Contract name',
      ok: Boolean(info.title.trim()),
      variant: 'required',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_TITLE,
      missingHelper: READINESS_HELPER_CONTRACT_NAME,
    },
    {
      key: 'id',
      label: 'Contract ID',
      ok: Boolean(id.trim()),
      variant: 'required',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_ID,
      missingHelper: READINESS_HELPER_CONTRACT_ID,
    },
    {
      key: 'owner',
      label: 'Contract owner',
      ok: Boolean(info.owner.trim()),
      variant: 'required',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_OWNER,
      missingHelper: READINESS_HELPER_CONTRACT_OWNER,
    },
    {
      key: 'version',
      label: 'Version',
      ok: SEMVER.test(info.version),
      variant: 'required',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_VERSION,
      missingHelper: READINESS_HELPER_CONTRACT_VERSION,
    },
    {
      key: 'schema',
      label: 'Schema fields',
      ok: schemaOk,
      variant: 'required',
      section: 'schema',
      fieldId: READINESS_FIELD_SCHEMA_ROOT,
      missingHelper: READINESS_HELPER_SCHEMA_FIELDS,
    },
  ]

  const recommended: ReadinessGuidanceItem[] = [
    {
      key: 'domain',
      label: READINESS_PANEL_LABEL_DOMAIN,
      ok: Boolean(info.domain.trim()),
      variant: 'recommended',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_DOMAIN,
    },
    {
      key: 'desc',
      label: READINESS_PANEL_LABEL_PURPOSE,
      ok: Boolean(info.description.trim()),
      variant: 'recommended',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_CONTRACT_PURPOSE,
    },
    {
      key: 'stakeholders',
      label: READINESS_PANEL_LABEL_CONTACTS,
      ok: contactCount > 0,
      variant: 'recommended',
      section: 'stakeholders',
      fieldId: READINESS_FIELD_STAKEHOLDERS_ROOT,
      badge: contactCount > 0 ? String(contactCount) : undefined,
    },
    {
      key: 'access-roles',
      label: READINESS_PANEL_LABEL_DATA_ACCESS,
      ok: hasExploitableDataAccessRole(contract),
      variant: 'recommended',
      section: 'accessRoles',
      fieldId: READINESS_FIELD_ACCESS_ROLES_ROOT,
    },
  ]

  if (!hasReferenceLinks(contract)) {
    recommended.push({
      key: 'ref-links',
      label: READINESS_PANEL_LABEL_REF_LINKS,
      ok: false,
      variant: 'recommended',
      section: 'fundamentals',
      fieldId: READINESS_FIELD_FUNDAMENTALS_REF_LINKS,
    })
  }

  return [...required, ...recommended]
}

export function issueToFieldId(issue: ValidationIssue): ReadinessFieldId | undefined {
  if (issue.fieldId) return issue.fieldId
  switch (issue.code) {
    case 'title':
      return READINESS_FIELD_CONTRACT_TITLE
    case 'id':
      return READINESS_FIELD_CONTRACT_ID
    case 'owner':
      return READINESS_FIELD_CONTRACT_OWNER
    case 'version':
      return READINESS_FIELD_CONTRACT_VERSION
    default:
      if (issue.section === 'schema') return READINESS_FIELD_SCHEMA_ROOT
      return undefined
  }
}

export function issueToSection(issue: ValidationIssue): SectionId {
  return issue.section ?? 'fundamentals'
}
