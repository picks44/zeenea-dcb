/** P1 ODCS v3.1.0 constants — source of truth aligned with p1.md */

export const ODCS_API_VERSION = 'v3.1.0' as const
export const ODCS_KIND = 'DataContract' as const

export const LIFECYCLE_STATUSES = [
  'proposed',
  'draft',
  'active',
  'deprecated',
  'retired',
] as const

export type OdcsLifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const QUALITY_DIMENSIONS = [
  'accuracy',
  'completeness',
  'conformity',
  'consistency',
  'coverage',
  'timeliness',
  'uniqueness',
] as const

export type QualityDimension = (typeof QUALITY_DIMENSIONS)[number]

export const FUNDAMENTALS_AUTH_DEF_TYPES = [
  'privacyStatement',
  'termsAndConditions',
  'licenseAgreement',
] as const

export type FundamentalsAuthDefType = (typeof FUNDAMENTALS_AUTH_DEF_TYPES)[number]

export const FUNDAMENTALS_AUTH_DEF_LABELS: Record<FundamentalsAuthDefType, string> = {
  privacyStatement: 'Privacy statement',
  termsAndConditions: 'Terms and Conditions',
  licenseAgreement: 'License Agreement',
}

export const ZEENEA_AUTH_DEF_TYPE = 'actian' as const

export const SHARED_AUTH_DEF_TYPES = [
  'businessDefinition',
  'transformationImplementation',
  'videoTutorial',
  'tutorial',
  'implementation',
] as const

export type SharedAuthDefType = (typeof SHARED_AUTH_DEF_TYPES)[number]

export const SLA_UNITS = [
  'd',
  'day',
  'days',
  'y',
  'yr',
  'years',
  'h',
  'hr',
  'hours',
] as const

export type SlaUnit = (typeof SLA_UNITS)[number]

export const SLA_DRIVERS = ['regulatory', 'analytics', 'operational'] as const

export type SlaDriver = (typeof SLA_DRIVERS)[number]

export const CONTRACT_ID_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const CUSTOM_PROPERTY_REGEX = /^[a-z][a-zA-Z0-9]*$/

export const SLA_ELEMENT_SEGMENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/

export const NOT_PRIMARY_KEY_POSITION = -1
