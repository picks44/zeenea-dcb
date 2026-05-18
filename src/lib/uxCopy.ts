/** Shared enterprise UX copy — Data Contract Builder MVP */

export const APP_NAME = 'Data Contract Builder'

export const NOT_EXPORTED_ODCS_MVP = 'Not exported to ODCS YAML in this MVP.'

export const EXPORT_COVERAGE = {
  exported:
    'Exported to ODCS YAML: contract identity, description, schema, tags, quality, authoritative links, data access roles, and service levels.',
  workflow:
    'Workflow metadata (not in YAML): contract owner, stakeholders, members, and version history.',
} as const

export const CONTRACT_OWNER_HELPER =
  `Used for governance accountability and publish eligibility in ${APP_NAME}. ${NOT_EXPORTED_ODCS_MVP}`

export const STAKEHOLDERS_BANNER =
  `Stakeholders are collaboration metadata for governance contact. ${NOT_EXPORTED_ODCS_MVP}`

export const MEMBERS_DISCLAIMER =
  `Members control editing access in ${APP_NAME}. This is separate from ODCS data access roles (Data access section). ${NOT_EXPORTED_ODCS_MVP}`

export const DATA_ACCESS_ROLES_INTRO =
  `Define ODCS data access roles for consumers of the published contract. To manage who can edit this contract, use Members in the toolbar.`

export const QUALITY_RULES_HELPER =
  'Natural language quality expectations. Exported as ODCS quality rules (type: text).'

export const AUTH_LINKS_HELPER =
  'Links to glossary, policy, documentation, or an external catalog reference. No integrated catalog picker in this MVP.'

export const RELATIONSHIPS_EXPORT_NOTE =
  'Only Belongs to and Many-to-many relationships are exported to ODCS YAML.'

export const RELATIONSHIP_FK_HELPER =
  'Select join columns to export this relationship as a foreign key in ODCS YAML.'

export const RELATIONSHIP_NOT_IN_YAML = 'Not in YAML'
