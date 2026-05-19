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

export const WORKFLOW_PILL_APP_ONLY = 'App only'
export const WORKFLOW_PILL_NOT_IN_EXPORTED_CONTRACT = 'Not in exported contract'

const WORKFLOW_PILL_APP_ONLY_TOOLTIP =
  'This information is managed in the app and is not included in the exported contract file.'

export const WORKFLOW_PILL_LABELS: Record<WorkflowMetadataPillVariant, string> = {
  'not-in-odcs': WORKFLOW_PILL_APP_ONLY,
  'workflow-only': WORKFLOW_PILL_APP_ONLY,
  'application-lifecycle': WORKFLOW_PILL_APP_ONLY,
  'not-published': WORKFLOW_PILL_NOT_IN_EXPORTED_CONTRACT,
}

export const WORKFLOW_PILL_TITLES: Record<WorkflowMetadataPillVariant, string> = {
  'not-in-odcs': WORKFLOW_PILL_APP_ONLY_TOOLTIP,
  'workflow-only': WORKFLOW_PILL_APP_ONLY_TOOLTIP,
  'application-lifecycle': WORKFLOW_PILL_APP_ONLY_TOOLTIP,
  'not-published':
    'This relationship is shown in the app but is not included in the exported contract file.',
}

export const EXPORT_COVERAGE = {
  includedInYaml:
    'Exported contract file: identity, description, schema, tags, quality rules, reference links, data access roles, and service levels.',
  excludedFromYaml:
    'Managed in the app only: contract owner, governance contacts, collaborators, and version history.',
} as const

// ─── Section concept tags (light visual differentiation) ─────────────────────

/** Accountability — Fundamentals / contract owner */
export const SECTION_CONCEPT_ACCOUNTABILITY = 'Accountability'
/** Application access — Collaborators modal & top bar */
export const SECTION_CONCEPT_APPLICATION_ACCESS = 'Application access'
/** Communication — Governance contacts */
export const SECTION_CONCEPT_COMMUNICATION = 'Communication & support'
/** Data contract — Data access roles (ODCS consumer roles) */
export const SECTION_CONCEPT_DATA_CONTRACT = 'Data contract'
/** Service levels — SLA section */
export const SECTION_CONCEPT_SERVICE_LEVELS = 'Service commitment'

// ─── Fundamentals ────────────────────────────────────────────────────────────

export const FUNDAMENTALS_INTRO =
  'Core contract identity and business accountability. Who can edit in the app is managed in Collaborators — separate from the contract owner below.'

export const CONTRACT_OWNER_HELPER =
  'Business owner accountable for this contract and publication approval. This is not an app login role — use Collaborators to grant editing access.'

// ─── Governance contacts (workflow metadata; not in ODCS YAML) ───────────────

export const STAKEHOLDERS_INTRO =
  'Operational or business contacts for this contract — stewardship, analytics, support, compliance, and similar roles. These are people to reach out to, not app permissions.'

export const STAKEHOLDERS_EMPTY_TITLE = 'No governance contacts yet'
export const STAKEHOLDERS_EMPTY_BODY =
  'Add contacts your teams can reach for questions about this contract — distinct from the contract owner and from Collaborators.'
export const STAKEHOLDERS_EMPTY_CTA = 'Add contact'

// ─── Publication readiness ─────────────────────────────────────────────────────

export const HEALTH_GOVERNANCE_OWNER_CHECK = 'Business contract owner defined'
export const HEALTH_GOVERNANCE_CONTACTS_CHECK = 'Governance contacts listed'

export const PUBLICATION_READY_REQUIRED_COMPLETE =
  'Publication requirements complete'

export const PUBLICATION_READY_TOOLTIP =
  'All required publication metadata is defined.'

export const CONTRACT_QUALITY_PANEL_TITLE = 'Contract quality'

export const PUBLISHED_READ_ONLY_STATUS = 'Published — read-only'

export const PUBLISHED_REQUIRED_SECTION_TITLE = 'Publication requirements'

export const START_NEW_VERSION_QUALITY_NOTE =
  'Start a new version to improve contract quality.'

export const READINESS_PANEL_TITLE = 'Publication readiness'
export const READINESS_REQUIRED_SECTION_TITLE = 'Required before publishing'
export const READINESS_IMPROVE_SECTION_TITLE = 'Improve your contract'
export const READINESS_FIELD_QUALITY_TITLE = 'Field quality'
export const READINESS_NEXT_STEPS_TITLE = 'Suggested next steps'
export const READINESS_VALIDATION_DETAILS_TITLE = 'Details to fix'

export const READINESS_SCORE_TOOLTIP =
  'Score reflects required fields, documentation, and recommended items.'

export const READINESS_RECOMMENDATIONS_SECTION_TITLE = 'Recommendations'

export const NO_CHANGES_TO_PUBLISH = 'No changes to publish since the last version.'

// Readiness navigation — field anchors (data attributes / registration ids)
export const READINESS_FIELD_CONTRACT_TITLE = 'contract-title'
export const READINESS_FIELD_CONTRACT_ID = 'contract-id'
export const READINESS_FIELD_CONTRACT_OWNER = 'contract-owner'
export const READINESS_FIELD_CONTRACT_VERSION = 'contract-version'
export const READINESS_FIELD_CONTRACT_DOMAIN = 'contract-domain'
export const READINESS_FIELD_CONTRACT_PURPOSE = 'contract-purpose'
export const READINESS_FIELD_STAKEHOLDERS_ROOT = 'stakeholders-root'
export const READINESS_FIELD_FUNDAMENTALS_REF_LINKS = 'fundamentals-ref-links'
export const READINESS_FIELD_SCHEMA_ROOT = 'schema-root'

/** Shown in form only after publish attempt or guided navigation (level 2–3). */
export const READINESS_HELPER_CONTRACT_NAME = 'Needed to publish this contract.'
export const READINESS_HELPER_CONTRACT_ID = 'Needed for export identity.'
export const READINESS_HELPER_CONTRACT_OWNER = 'Business owner required before publishing.'
export const READINESS_HELPER_CONTRACT_VERSION = 'Use SemVer, e.g. 1.0.0.'
export const READINESS_HELPER_SCHEMA_FIELDS = 'Add at least one table and field.'

/** Short labels for readiness panel rows (no multiline helpers in panel). */
export const READINESS_PANEL_LABEL_DOMAIN = 'Domain'
export const READINESS_PANEL_LABEL_PURPOSE = 'Business purpose'
export const READINESS_PANEL_LABEL_CONTACTS = 'Governance contacts'
export const READINESS_PANEL_LABEL_FIELD_DOCS = 'Field descriptions'
export const READINESS_PANEL_LABEL_REF_LINKS = 'Reference links'

export const READINESS_GUIDANCE_FUNDAMENTALS_BANNER =
  'This section contains required publication information.'
export const READINESS_GUIDANCE_SCHEMA_BANNER =
  'Define at least one table and field before you can publish.'
export const READINESS_GUIDANCE_STAKEHOLDERS_BANNER =
  'List operational contacts teams can reach — especially helpful when personal data fields are present.'

export const DOCUMENTED_FIELDS_TOOLTIP =
  'Percentage of schema fields with business descriptions'

// ─── Data access & service levels ────────────────────────────────────────────

export const DATA_ACCESS_EMPTY_TITLE = 'No consumer access roles defined'
export const DATA_ACCESS_EMPTY_BODY =
  'Describe how data consumers may use this contract in your platform (read, write, etc.). This does not grant anyone access to the app or to live data systems.'
export const DATA_ACCESS_EMPTY_CTA = 'Add access role'
export const DATA_ACCESS_ADD_ROLE_CTA = 'Add access role'

export const SLA_EMPTY_TITLE = 'No service levels defined'
export const SLA_EMPTY_BODY =
  'Define latency, retention, and availability commitments for this contract.'
export const SLA_EMPTY_CTA = 'Add service level'

export const VERSION_HISTORY_INTRO_EMPTY = 'Track published versions of this contract.'

export function versionHistoryIntroCount(count: number): string {
  const noun = count === 1 ? 'version' : 'versions'
  return `${count} published ${noun} on record.`
}

// ─── Collaborators (application access; not in ODCS YAML) ───────────────────

export const COLLABORATORS_MODAL_TITLE = 'Collaborators'
export const COLLABORATORS_INTRO =
  `People who can view or edit this contract in ${APP_NAME}. This controls application access only — not the business contract owner or governance contacts.`
export const COLLABORATORS_EMPTY_TITLE = 'No collaborators yet'
export const COLLABORATORS_EMPTY_BODY =
  'Invite colleagues who should work on this contract in the application.'
export const COLLABORATORS_ALREADY_INVITED = 'This person is already a collaborator.'
export const COLLABORATORS_MORE_COUNT = (n: number) =>
  `${n} more collaborator${n === 1 ? '' : 's'}`

export const COLLABORATOR_ROLE_OPTIONS: { value: CollaboratorRole; label: string; desc: string }[] = [
  {
    value: 'owner',
    label: 'Publisher',
    desc: 'Can edit, manage versions, and publish in the app. Not the same as Contract owner in Fundamentals.',
  },
  {
    value: 'editor',
    label: 'Contributor',
    desc: 'Can edit draft content in the app but cannot publish.',
  },
  {
    value: 'viewer',
    label: 'Reader',
    desc: 'Read-only access to this contract in the app.',
  },
]

export const COLLABORATOR_ROLE_LABELS: Record<CollaboratorRole, string> = {
  owner: 'Publisher',
  editor: 'Contributor',
  viewer: 'Reader',
}

export const PUBLISH_REQUIRES_PUBLISHER =
  'Only collaborators with the Publisher role can publish.'

export const PUBLISH_REQUIRES_PUBLISHER_CONTRACT =
  'Only collaborators with the Publisher role can publish this contract.'

export const VIEWER_ACCESS_BANNER =
  'You have read-only access in the app. Ask a Publisher or Contributor to change your collaborator role.'

export const CANNOT_REMOVE_OWN_PUBLISHER_ROLE =
  'You cannot remove your own Publisher role.'

export const DATA_ACCESS_ROLES_INTRO =
  'Define consumer access roles described in this data contract (who may read or write contract data in your ecosystem). Application editing and publishing permissions are managed in Collaborators — they do not grant platform or app access.'

/** @deprecated Use COLLABORATORS_INTRO */
export const MEMBERS_DISCLAIMER = COLLABORATORS_INTRO
/** @deprecated Use COLLABORATOR_ROLE_OPTIONS */
export const MEMBER_ROLE_OPTIONS = COLLABORATOR_ROLE_OPTIONS
/** @deprecated Use COLLABORATOR_ROLE_LABELS */
export const MEMBER_ROLE_LABELS = COLLABORATOR_ROLE_LABELS

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
