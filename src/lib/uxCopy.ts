/** Shared enterprise UX copy — Data Contract Builder MVP */

import type { CollaboratorRole } from '@/types/odcs'

export const APP_NAME = 'Data Contract Builder'

// ─── Section & navigation labels ─────────────────────────────────────────────

export const NAV_IMPORT_SQL = 'Import SQL'
export const NAV_FUNDAMENTALS = 'Fundamentals'
export const NAV_SCHEMA = 'Schema'
/** Nav label — full section title is SECTION_GOVERNANCE_CONTACTS. */
export const NAV_GOVERNANCE_CONTACTS = 'Contacts'
export const SECTION_GOVERNANCE_CONTACTS = 'Governance contacts'
export const NAV_DATA_ACCESS = 'Data access'
export const NAV_SERVICE_LEVELS = 'Service levels'
export const NAV_VERSIONS = 'Versions'

// ─── Metadata field labels (UI; ODCS paths unchanged in export) ───────────────

export const LABEL_CONTRACT_OWNER = 'Contract owner'
export const LABEL_QUALITY_RULES = 'Quality rules'
export const LABEL_REFERENCE_LINKS = 'Reference links'
export const LABEL_FOREIGN_KEY = 'Foreign key'
export const LABEL_TAGS = 'Tags'

/** @deprecated Prefer LABEL_REFERENCE_LINKS */
export const LABEL_AUTHORITATIVE_LINKS = LABEL_REFERENCE_LINKS

// ─── Metadata helpers & empty states ─────────────────────────────────────────

export const QUALITY_RULES_HELPER =
  'Describe what good data should look like for this field or table.'

export const AUTH_LINKS_HELPER =
  'Links to glossary entries, policies, documentation, or catalog pages that support this contract.'

export const REFERENCE_LINKS_EMPTY = 'No reference links added.'
export const QUALITY_RULES_EMPTY = 'No quality rules defined.'

export const FIELD_PROPERTIES_TITLE =
  'Field properties: description, foreign key, quality rules, reference links'
export const TABLE_PROPERTIES_TITLE =
  'Table properties: description, tags, quality rules, reference links, relationships'

// ─── Workflow / export pills ───────────────────────────────────────────────────

export type WorkflowMetadataPillVariant =
  | 'workflow-only'
  | 'not-in-odcs'
  | 'application-lifecycle'
  | 'not-published'

export const WORKFLOW_PILL_NOT_IN_ODCS = 'Not in ODCS YAML'
export const WORKFLOW_PILL_WORKFLOW_ONLY = 'Workflow-only'
export const WORKFLOW_PILL_APPLICATION_LIFECYCLE = 'Application lifecycle'
export const WORKFLOW_PILL_NOT_PUBLISHED = 'Not published'

export const WORKFLOW_PILL_TITLES: Record<WorkflowMetadataPillVariant, string> = {
  'not-in-odcs':
    'Stored in the application for governance. Intentionally excluded from the ODCS YAML export.',
  'workflow-only':
    'Used for collaboration, permissions, and contract lifecycle in the application. Not part of the ODCS contract.',
  'application-lifecycle':
    'Version history and publish workflow metadata. Not included in the ODCS YAML payload.',
  'not-published':
    'Visible while editing. Excluded from the published ODCS YAML output until requirements are met.',
}

export const EXPORT_COVERAGE = {
  includedInYaml:
    'Published in ODCS YAML: identity, description, schema, tags, quality rules, reference links, data access roles, and service levels.',
  excludedFromYaml:
    'Excluded from ODCS YAML: contract owner, governance contacts, members, and version history.',
} as const

// ─── Fundamentals ────────────────────────────────────────────────────────────

export const CONTRACT_OWNER_HELPER =
  'Business owner responsible for governance accountability and publication approval.'

// ─── Governance contacts (workflow metadata; not in ODCS YAML) ───────────────

export const STAKEHOLDERS_INTRO =
  'People accountable for this contract — owners, stewards, and operational contacts.'

export const STAKEHOLDERS_EMPTY_TITLE = 'No contacts assigned'
export const STAKEHOLDERS_EMPTY_BODY =
  'Add governance contacts so ownership is clear on this contract.'
export const STAKEHOLDERS_EMPTY_CTA = 'Add contact'

// ─── Publication readiness ─────────────────────────────────────────────────────

export const HEALTH_GOVERNANCE_OWNER_CHECK = 'Contract owner defined'
export const HEALTH_GOVERNANCE_CONTACTS_CHECK = 'Governance contacts assigned'

export const PUBLICATION_READY_REQUIRED_COMPLETE =
  'Publication requirements complete'

export const PUBLICATION_READY_TOOLTIP =
  'All required publication metadata is defined.'

export const CONTRACT_QUALITY_PANEL_TITLE = 'Contract quality'

export const PUBLISHED_READ_ONLY_STATUS = 'Published — read-only'

export const PUBLISHED_REQUIRED_SECTION_TITLE = 'Publication requirements'

export const START_NEW_VERSION_QUALITY_NOTE =
  'Start a new version to improve contract quality.'

export const READINESS_SCORE_TOOLTIP =
  'Weighted score: required publication metadata (largest), field documentation, then optional governance items'

export const DOCUMENTED_FIELDS_TOOLTIP =
  'Percentage of schema fields with business descriptions'

// ─── Data access & service levels ────────────────────────────────────────────

export const DATA_ACCESS_EMPTY_TITLE = 'No data access roles defined'
export const DATA_ACCESS_EMPTY_BODY =
  'Define roles and permissions for consumers of this contract.'
export const DATA_ACCESS_EMPTY_CTA = 'Add role'

export const SLA_EMPTY_TITLE = 'No service levels defined'
export const SLA_EMPTY_BODY =
  'Define latency, retention, and availability commitments for this contract.'
export const SLA_EMPTY_CTA = 'Add service level'

export const VERSION_HISTORY_INTRO_EMPTY = 'Track published versions of this contract.'

export function versionHistoryIntroCount(count: number): string {
  const noun = count === 1 ? 'version' : 'versions'
  return `${count} published ${noun} on record.`
}

// ─── Members ─────────────────────────────────────────────────────────────────

export const MEMBERS_DISCLAIMER =
  `Control who can edit and publish this contract in ${APP_NAME}.`

export const MEMBER_ROLE_OPTIONS: { value: CollaboratorRole; label: string; desc: string }[] = [
  {
    value: 'owner',
    label: 'Publisher',
    desc: 'Can edit the contract, manage versions, and publish changes.',
  },
  {
    value: 'editor',
    label: 'Contributor',
    desc: 'Can edit draft content but cannot publish.',
  },
  {
    value: 'viewer',
    label: 'Reader',
    desc: 'Read-only access.',
  },
]

export const MEMBER_ROLE_LABELS: Record<CollaboratorRole, string> = {
  owner: 'Publisher',
  editor: 'Contributor',
  viewer: 'Reader',
}

export const PUBLISH_REQUIRES_PUBLISHER = 'Only members with the Publisher role can publish.'

export const PUBLISH_REQUIRES_PUBLISHER_CONTRACT =
  'Only members with the Publisher role can publish this contract.'

export const VIEWER_ACCESS_BANNER =
  'You have read-only access to this contract. Contact a Publisher or Contributor to request editing permissions.'

export const CANNOT_REMOVE_OWN_PUBLISHER_ROLE =
  'You cannot remove your own Publisher role.'

export const DATA_ACCESS_ROLES_INTRO =
  'Define who may access this contract data and what permissions apply. Editing permissions are managed in Members.'

// ─── Schema relationships ──────────────────────────────────────────────────────

export const TABLE_RELATIONSHIPS_INTRO =
  'Multi-column foreign keys and many-to-many links defined at table level.'

export const TABLE_RELATIONSHIPS_EMPTY =
  'No table-level relationships defined.'

/** @deprecated Use TABLE_RELATIONSHIPS_INTRO */
export const RELATIONSHIPS_SECTION_INTRO = TABLE_RELATIONSHIPS_INTRO

export const RELATIONSHIP_FK_HELPER =
  'Select referenced table and fields to include this relationship in the published contract.'

export const RELATIONSHIP_COMPOSITE_HELPER =
  'Select at least two source columns and matching referenced columns (same count and order).'

export const RELATIONSHIP_SINGLE_FK_HINT =
  'Single-column links are set on fields — open field properties for this table.'

export const FIELD_FK_INTRO =
  'Reference this field to another table field.'

export const FIELD_FK_HELPER =
  'Referenced table and field are required to publish this foreign key.'

// ─── Compare / changelog phrasing (business-readable) ─────────────────────────

export const CHANGELOG_REFERENCE_LINK = 'reference link'
export const CHANGELOG_REFERENCE_LINKS = 'reference links'
export const CHANGELOG_SERVICE_LEVEL = 'service level'
export const CHANGELOG_SERVICE_LEVELS = 'service levels'
