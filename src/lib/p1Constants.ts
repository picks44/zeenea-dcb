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

/**
 * Strict Actian/Zeenea URL pattern for P1 MVP (documented).
 * Production URLs must match this host/path shape or exist in the mock catalog.
 */
export const ZEENEA_ACTIAN_URL_PATTERN =
  /^https:\/\/catalog\.zeenea\.example\/actian\/[a-z0-9/_-]+$/

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

/** ODCS P1 IAM access levels for `roles[].access`. */
export const ROLE_ACCESS_VALUES = ['read', 'write'] as const

export type RoleAccess = (typeof ROLE_ACCESS_VALUES)[number]

/** ODCS v3.1.0 Data QoS SLA property types (case-sensitive). */
export const SLA_PROPERTY_TYPES = [
  'latency',
  'retention',
  'frequency',
  'availability',
  'throughput',
  'errorRate',
  'generalAvailability',
  'endOfSupport',
  'endOfLife',
  'timeOfAvailability',
  'timeToDetect',
  'timeToNotify',
  'timeToRepair',
] as const

export type SlaPropertyType = (typeof SLA_PROPERTY_TYPES)[number]

export const SLA_PROPERTY_LABELS: Record<SlaPropertyType, string> = {
  latency: 'Latency',
  retention: 'Retention',
  frequency: 'Frequency',
  availability: 'Availability',
  throughput: 'Throughput',
  errorRate: 'Error rate',
  generalAvailability: 'General availability',
  endOfSupport: 'End of support',
  endOfLife: 'End of life',
  timeOfAvailability: 'Time of availability',
  timeToDetect: 'Time to detect',
  timeToNotify: 'Time to notify',
  timeToRepair: 'Time to repair',
}

export const CONTRACT_ID_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const CUSTOM_PROPERTY_REGEX = /^[a-z][a-zA-Z0-9]*$/

export const SLA_ELEMENT_SEGMENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/

export const NOT_PRIMARY_KEY_POSITION = -1

/** ODCS schema object physical types (P0). */
export const SCHEMA_PHYSICAL_TYPES = ['table', 'view', 'topic', 'file'] as const

export type SchemaPhysicalType = (typeof SCHEMA_PHYSICAL_TYPES)[number]

/** ODCS property sensitivity classification (P0). */
export const CLASSIFICATION_VALUES = ['public', 'restricted', 'confidential'] as const

export type ClassificationValue = (typeof CLASSIFICATION_VALUES)[number]

/** Logical types accepted in ODCS YAML export (P0). */
export const ODCS_LOGICAL_TYPES = [
  'string',
  'integer',
  'number',
  'boolean',
  'timestamp',
  'date',
  'time',
  'object',
  'array',
] as const

export type OdcsLogicalType = (typeof ODCS_LOGICAL_TYPES)[number]

/** App-only logical type from DDL import — not valid for ODCS export. */
export const APP_ONLY_LOGICAL_TYPES = ['unknown'] as const

export type AppOnlyLogicalType = (typeof APP_ONLY_LOGICAL_TYPES)[number]
