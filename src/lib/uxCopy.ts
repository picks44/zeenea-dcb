/** Shared enterprise UX copy — Data Contract Builder MVP */

import type { CollaboratorRole } from '@/types/odcs'

export const APP_NAME = 'Data Contract Builder'

export const NOT_EXPORTED_ODCS_MVP = 'Not exported to ODCS YAML in this MVP.'

/** Shown only in YAML preview panels (Export YAML footer, YAML tab). */
export const EXPORT_COVERAGE = {
  includedInYaml:
    'In this YAML: contract identity, description, schema, tags, quality, authoritative links, data access roles, and service levels.',
  workflowOnly:
    'Not in YAML: governance owner, stakeholders, members, and version history.',
} as const

/** Fundamentals — governance accountability (not a Members permission role). */
export const CONTRACT_OWNER_HELPER =
  `Business owner responsible for governance accountability and publication approval. ${NOT_EXPORTED_ODCS_MVP}`

export const STAKEHOLDERS_SECTION_HELPER =
  'Used for collaboration and governance workflows. Not exported to ODCS YAML in this MVP.'

export const STAKEHOLDERS_EMPTY_TITLE = 'No stakeholders added yet.'
export const STAKEHOLDERS_EMPTY_BODY =
  'Add governance and operational contacts for ownership and collaboration. Not exported to ODCS YAML in this MVP.'
export const STAKEHOLDERS_EMPTY_CTA = 'Add stakeholder'

export const STAKEHOLDERS_WITH_ENTRIES_HINT =
  'Add or update contacts as governance and operational responsibilities evolve.'

/** Publication readiness — required to publish (governance field, not Publisher role). */
export const HEALTH_GOVERNANCE_OWNER_CHECK = 'Governance owner defined'

export const PUBLICATION_READY_REQUIRED_COMPLETE =
  'Required publication metadata complete'

export const READINESS_SCORE_TOOLTIP =
  'Weighted score: required publication metadata (largest), field documentation, then optional governance items'

export const DOCUMENTED_FIELDS_TOOLTIP =
  'Percentage of schema fields with business descriptions'

export const DATA_ACCESS_EMPTY_TITLE = 'No data access roles defined'
export const DATA_ACCESS_EMPTY_BODY =
  'Add roles to describe expected access for consumers of this contract.'
export const DATA_ACCESS_EMPTY_CTA = 'Add a role to describe expected access permissions.'

export const VERSION_HISTORY_INTRO_EMPTY =
  'No published versions yet. Version history is managed in this application and is not included in the ODCS YAML export.'

export function versionHistoryIntroCount(count: number): string {
  const noun = count === 1 ? 'version' : 'versions'
  return `${count} published ${noun} — managed in this application, not included in the ODCS YAML export.`
}

export const MEMBERS_DISCLAIMER =
  `Members control who can edit and publish this contract in ${APP_NAME}. This is separate from ODCS data access roles.`

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
  'Define who may access this contract data and what permissions apply. To manage editing and publishing permissions, use Members in the toolbar.'

export const QUALITY_RULES_HELPER =
  'Natural language quality expectations for this field or table.'

export const AUTH_LINKS_HELPER =
  'Links to glossary, policy, documentation, or external catalog references.'

export const RELATIONSHIPS_PUBLISH_NOTE =
  'Only Belongs to and Many-to-many relationships are included in the published contract. Other types are not published.'

export const RELATIONSHIP_FK_HELPER =
  'Select join columns to publish this relationship as a foreign key.'

export const RELATIONSHIP_NOT_PUBLISHED = 'Not published'
