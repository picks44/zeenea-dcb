import type { CollaboratorRole, DataContract } from '@/types/odcs'
import { validateContract, type ValidationIssue, type ValidationResult } from '@/lib/contractValidation'
import { buildReadinessGuidanceItems, type ReadinessGuidanceItem } from '@/lib/readinessGuidance'
import { countAssignedStakeholders } from '@/lib/stakeholders'
import { PUBLISH_REQUIRES_PUBLISHER, PUBLICATION_READY_REQUIRED_COMPLETE } from '@/lib/uxCopy'

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

/** @deprecated Use ReadinessGuidanceItem from readinessGuidance */
export type ReadinessCheck = ReadinessGuidanceItem

export interface PublicationReadiness {
  guidanceItems: ReadinessGuidanceItem[]
  requiredChecks: ReadinessGuidanceItem[]
  recommendedChecks: ReadinessGuidanceItem[]
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
  allContracts?: DataContract[],
): PublicationReadiness {
  const { dataset } = contract
  const validation = validateContract(contract, allContracts)
  const stakeholderCount = countAssignedStakeholders(contract.stakeholders)
  const guidanceItems = buildReadinessGuidanceItems(contract, allContracts)
  const requiredChecks = guidanceItems.filter(i => i.variant === 'required')
  const recommendedChecks = guidanceItems.filter(i => i.variant === 'recommended')

  const fieldCount = dataset.reduce((acc, t) => acc + t.columns.length, 0)
  const fieldsWithDesc = dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.description.trim()).length,
    0,
  )
  const piiCount = dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.isPII).length,
    0,
  )

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
  for (const check of requiredChecks.filter(c => !c.ok)) {
    nextSteps.push(`Complete ${check.label}`)
    if (nextSteps.length >= 2) break
  }
  if (nextSteps.length < 2 && fieldCount > 0 && fieldsWithDesc < fieldCount) {
    nextSteps.push('Add field descriptions')
  }
  if (nextSteps.length < 2 && stakeholderCount === 0 && fieldCount > 0 && piiCount > 0) {
    nextSteps.push('Add governance contacts')
  }

  return {
    guidanceItems,
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
