/** Shared enterprise UX copy — Data Contract Builder MVP */

import type { CollaboratorRole } from '@/types/odcs'

export const APP_NAME = 'Data Contract Builder'

export const NOT_EXPORTED_ODCS_MVP = 'Not exported to ODCS YAML in this MVP.'

export const EXPORT_COVERAGE = {
  exported:
    'Exported to ODCS YAML: contract identity, description, schema, tags, quality, authoritative links, data access roles, and service levels.',
  workflow:
    'Workflow metadata (not in YAML): contract owner, stakeholders, members, and version history.',
} as const

/** Fundamentals — governance accountability (not a Members permission role). */
export const CONTRACT_OWNER_HELPER =
  `Business owner responsible for governance accountability and publication approval. ${NOT_EXPORTED_ODCS_MVP}`

export const STAKEHOLDERS_BANNER =
  `Stakeholders are collaboration metadata for governance contact. ${NOT_EXPORTED_ODCS_MVP}`

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
  'Define ODCS data access roles for consumers of the published contract. To manage editing and publishing permissions, use Members in the toolbar.'

export const QUALITY_RULES_HELPER =
  'Natural language quality expectations. Exported as ODCS quality rules (type: text).'

export const AUTH_LINKS_HELPER =
  'Links to glossary, policy, documentation, or an external catalog reference. No integrated catalog picker in this MVP.'

export const RELATIONSHIPS_EXPORT_NOTE =
  'Only Belongs to and Many-to-many relationships are exported to ODCS YAML.'

export const RELATIONSHIP_FK_HELPER =
  'Select join columns to export this relationship as a foreign key in ODCS YAML.'

export const RELATIONSHIP_NOT_IN_YAML = 'Not in YAML'
