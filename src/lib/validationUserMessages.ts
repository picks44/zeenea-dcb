import type { ValidationIssue, ValidationResult } from '@/lib/contractValidation'

const USER_MESSAGES: Partial<Record<ValidationIssue['code'], string>> = {
  // C1
  'status-invalid':
    'Contract status is invalid. Try starting a draft or creating a new version.',
  'auth-def-fundamentals-type':
    'Choose Privacy statement, Terms and conditions, or License agreement for each reference link.',
  'auth-def-zeenea':
    'Use a link from the Zeenea catalog for each schema or field reference.',
  'relationship-not-exported':
    'This relationship will not be included in the exported contract. Update it to a supported link type or set it on a field.',
  'quality-ai-unverified':
    'Review and confirm table quality rules before publishing.',
  'sla-element-invalid':
    'Link the SLA to a field using Table.field, for example orders.createdAt. Separate multiple fields with commas.',
  'sla-property-required':
    'Choose an SLA type (for example latency or retention) for each service level row.',
  'sla-property-invalid':
    'SLA type must be one of the supported ODCS values (latency, retention, frequency, etc.).',

  // C2
  'id-format':
    'Contract identifier can only use lowercase letters, numbers, and hyphens.',
  'id-derived':
    'Update the contract name — the identifier is generated from it automatically.',
  'id-duplicate':
    'Another contract already uses this identifier. Change the contract name.',
  'pk-positions':
    'Fix primary key order on this table — keys must be numbered 1, 2, 3 without gaps.',
  'schema-name-required':
    'Each table needs a technical name before publishing.',
  'property-name-required':
    'Each field needs a name before publishing.',
  'logical-type-unknown':
    'Choose a supported field type — unknown types cannot be published.',
  'classification-invalid':
    'Choose public, restricted, or confidential for field classification.',
  'schema-physical-type-invalid':
    'Choose a supported table type: table, view, topic, or file.',
  'quality-type-invalid':
    'Quality rules must be written as text descriptions.',
  'quality-dimension-invalid':
    'Choose a supported quality dimension.',
  'array-items':
    'Define what each list item contains: a type or nested fields.',
  'custom-property-format':
    'Property names must start with a lowercase letter and use no spaces, for example dataSteward.',
  'sla-unit-invalid':
    'Use a supported time unit: days, hours, or years.',
  'composite-fk-incomplete':
    'Multi-column links need at least two source columns and two referenced columns.',

  // C3
  'role-access-invalid': 'Access level must be Read or Write.',
  'sla-driver-invalid': 'Choose a driver: regulatory, analytics, or operational.',
  'quality-dimension': 'Select a quality dimension for each rule.',
  'auth-def-incomplete': 'Each reference link needs a URL and a type.',
  'schema-id-duplicate':
    'This contract has duplicate internal table identifiers. Re-import or contact support.',
  'property-id-duplicate':
    'This contract has duplicate internal field identifiers. Re-import or contact support.',
  'column-fk-incomplete': 'Select the referenced table and field.',
  'relationship-incomplete-fk':
    'Finish this relationship by selecting the referenced table and field.',
  'pii-stakeholders':
    'Personal data fields detected — add governance contacts for privacy questions.',
}

const LIFECYCLE_PUBLISH_BLOCK =
  'Contract must be in draft (or in revision) before publishing.'

const LIFECYCLE_PUBLISH_BLOCK_USER =
  'Start a new version to edit, or finish drafting before you publish.'

/** User-facing copy for validation issues shown in Readiness / Publish UI. */
export function validationUserMessage(issue: ValidationIssue): string {
  return USER_MESSAGES[issue.code] ?? issue.message
}

/** User-facing publish block reason derived from validation (header / tooltip). */
export function publishBlockUserMessage(validation: ValidationResult): string | null {
  if (validation.canPublish) return null

  if (validation.errors.length > 0) {
    return validationUserMessage(validation.errors[0])
  }

  if (validation.publishBlockReason === LIFECYCLE_PUBLISH_BLOCK) {
    return LIFECYCLE_PUBLISH_BLOCK_USER
  }

  return validation.publishBlockReason
}
