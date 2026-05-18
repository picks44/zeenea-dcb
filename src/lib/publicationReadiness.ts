import type { CollaboratorRole, DataContract } from '@/types/odcs'
import { validateContract, type ValidationIssue, type ValidationResult } from '@/lib/contractValidation'
import { countAssignedStakeholders } from '@/lib/stakeholders'
import {
  HEALTH_GOVERNANCE_OWNER_CHECK,
  PUBLISH_REQUIRES_PUBLISHER,
  PUBLICATION_READY_REQUIRED_COMPLETE,
} from '@/lib/uxCopy'

export const READINESS_REQUIRED_WEIGHT = 70
export const READINESS_DOC_WEIGHT = 25
export const READINESS_RECOMMENDED_WEIGHT = 5

export interface ReadinessScoreContribution {
  earned: number
  max: number
}

export interface ReadinessScoreContributions {
  required: ReadinessScoreContribution
  documentation: ReadinessScoreContribution
  recommended: ReadinessScoreContribution
}

export interface ReadinessCheck {
  key: string
  label: string
  ok: boolean
  badge?: string
}

export interface PublicationReadiness {
  requiredChecks: ReadinessCheck[]
  recommendedChecks: ReadinessCheck[]
  doneRequired: number
  doneRecommended: number
  publishStatus: { ready: boolean; message: string }
  fieldCount: number
  fieldsWithDesc: number
  descCoverage: number
  piiCount: number
  stakeholderCount: number
  healthScore: number
  scoreContributions: ReadinessScoreContributions
  nextSteps: string[]
  validationErrors: ValidationIssue[]
  validationWarnings: ValidationIssue[]
}

function publishReadinessMessage(
  validation: ValidationResult,
  myRole: CollaboratorRole,
  hasEditedSincePublish: boolean,
): { ready: boolean; message: string } {
  if (!validation.canPublish) {
    return {
      ready: false,
      message: validation.publishBlockReason ?? 'Complete required fields to publish.',
    }
  }
  if (myRole !== 'owner') {
    return { ready: false, message: PUBLISH_REQUIRES_PUBLISHER }
  }
  if (!hasEditedSincePublish) {
    return { ready: false, message: 'No unpublished changes since last publish.' }
  }
  return { ready: true, message: PUBLICATION_READY_REQUIRED_COMPLETE }
}

export function computePublicationReadiness(
  contract: DataContract,
  myRole: CollaboratorRole,
  hasEditedSincePublish: boolean,
): PublicationReadiness {
  const { info, id, dataset } = contract
  const validation = validateContract(contract)
  const stakeholderCount = countAssignedStakeholders(contract.stakeholders)

  const fieldCount = dataset.reduce((acc, t) => acc + t.columns.length, 0)
  const fieldsWithDesc = dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.description.trim()).length,
    0,
  )
  const piiCount = dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.isPII).length,
    0,
  )

  const errorKeys = new Set(validation.errors.map(e => e.code))
  const schemaOk = !validation.errors.some(e => e.section === 'schema')

  const requiredChecks: ReadinessCheck[] = [
    { key: 'title', label: 'Contract name', ok: !errorKeys.has('title') },
    { key: 'id', label: 'Contract ID', ok: !errorKeys.has('id') },
    { key: 'owner', label: HEALTH_GOVERNANCE_OWNER_CHECK, ok: !errorKeys.has('owner') },
    { key: 'version', label: 'Version (e.g. 1.0.0)', ok: !errorKeys.has('version') },
    { key: 'schema', label: 'At least one field defined', ok: schemaOk },
  ]

  const hasStakeholders = stakeholderCount > 0
  const recommendedChecks: ReadinessCheck[] = [
    { key: 'domain', label: 'Domain', ok: Boolean(info.domain.trim()) },
    { key: 'desc', label: 'Business description', ok: Boolean(info.description.trim()) },
    {
      key: 'stakeholders',
      label: 'Stakeholders assigned',
      ok: hasStakeholders,
      badge: hasStakeholders ? String(stakeholderCount) : undefined,
    },
  ]

  const doneRequired = requiredChecks.filter(c => c.ok).length
  const doneRecommended = recommendedChecks.filter(c => c.ok).length
  const publishStatus = publishReadinessMessage(validation, myRole, hasEditedSincePublish)
  const descCoverage = fieldCount > 0 ? fieldsWithDesc / fieldCount : 0

  const requiredScore = (doneRequired / requiredChecks.length) * READINESS_REQUIRED_WEIGHT
  const docScore = fieldCount > 0 ? descCoverage * READINESS_DOC_WEIGHT : 0
  const recommendedScore =
    (doneRecommended / recommendedChecks.length) * READINESS_RECOMMENDED_WEIGHT

  const scoreContributions: ReadinessScoreContributions = {
    required: {
      earned: Math.round(requiredScore),
      max: READINESS_REQUIRED_WEIGHT,
    },
    documentation: {
      earned: Math.round(docScore),
      max: READINESS_DOC_WEIGHT,
    },
    recommended: {
      earned: Math.round(recommendedScore),
      max: READINESS_RECOMMENDED_WEIGHT,
    },
  }

  const healthScore = Math.min(
    100,
    Math.round(requiredScore + docScore + recommendedScore),
  )

  const nextSteps: string[] = []
  if (!info.title.trim()) {
    nextSteps.push('Give your contract a name in Fundamentals')
  } else if (!id.trim()) {
    nextSteps.push('Set a contract ID in Fundamentals')
  } else if (!info.owner.trim()) {
    nextSteps.push('Assign a governance owner in Fundamentals')
  } else if (fieldCount === 0) {
    nextSteps.push('Add at least one field in Schema to describe your data')
  }
  if (nextSteps.length < 2 && fieldCount > 0 && fieldsWithDesc < fieldCount) {
    nextSteps.push('Document schema fields to improve discoverability and reuse')
  }
  if (nextSteps.length < 2 && !hasStakeholders) {
    if (piiCount > 0 && fieldCount > 0) {
      nextSteps.push(
        `${piiCount} PII field${piiCount > 1 ? 's' : ''} detected — add stakeholders including Data Privacy`,
      )
    } else if (fieldCount > 0) {
      nextSteps.push('Assign stakeholders for ownership and collaboration')
    }
  }

  return {
    requiredChecks,
    recommendedChecks,
    doneRequired,
    doneRecommended,
    publishStatus,
    fieldCount,
    fieldsWithDesc,
    descCoverage,
    piiCount,
    stakeholderCount,
    healthScore,
    scoreContributions,
    nextSteps: nextSteps.slice(0, 2),
    validationErrors: validation.errors,
    validationWarnings: validation.warnings,
  }
}
