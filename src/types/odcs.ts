export type LifecycleStatus = 'draft' | 'active' | 'deprecated'

export type LogicalType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'object'
  | 'array'
  | 'unknown'

export type SectionId =
  | 'import'
  | 'fundamentals'
  | 'schema'
  | 'versions'
  | 'stakeholders'
  | 'terms'
  | 'servers'
  | 'team'
  | 'sla'
  | 'pricing'
  | 'custom'
  | 'collaboration'
  | 'tests'

export interface ColumnDefinition {
  id: string
  physicalName: string
  logicalName: string
  physicalType: string
  logicalType: LogicalType
  required: boolean
  isPrimaryKey: boolean
  isPII: boolean
  isUnique: boolean
  description: string
  examples: string
  qualityRule: string
  isUnknownType: boolean
}

export type RelationshipType = 'has_one' | 'has_many' | 'belongs_to' | 'many_to_many'

export interface TableRelationship {
  id: string
  toTable: string
  type: RelationshipType
  fromColumn?: string
  toColumn?: string
}

export interface SchemaTable {
  physicalName: string
  quantumName: string
  tableType: 'table' | 'view'
  description: string
  columns: ColumnDefinition[]
  relationships?: TableRelationship[]
}

export interface Stakeholder {
  id: string
  name: string
  role: string
  email: string
  team: string
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer'

export interface Collaborator {
  id: string
  name: string
  email: string
  role: CollaboratorRole
  invitedAt: string
}

export interface DataContractSnapshot {
  id: string
  info: {
    title: string
    version: string
    domain: string
    owner: string
    description: string
    status: LifecycleStatus
    tags: string[]
  }
  dataset: SchemaTable[]
  stakeholders: Stakeholder[]
  collaborators?: Collaborator[]
}

export interface GitCommit {
  hash: string
  message: string
  timestamp: string
  version: string
  contractStatus: LifecycleStatus
  prNumber?: number
  snapshot?: DataContractSnapshot
}

export interface GitPR {
  number: number
  title: string
  branch: string
  commitHash: string
  createdAt: string
  mergedAt?: string
  status: 'open' | 'merged'
}

export interface DataContract {
  uid: string
  dataContractSpecification: '3.1.0'
  id: string
  info: {
    title: string
    version: string
    domain: string
    owner: string
    description: string
    status: LifecycleStatus
    tags: string[]
  }
  dataset: SchemaTable[]
  stakeholders: Stakeholder[]
  collaborators?: Collaborator[]
  gitHistory: GitCommit[]
  openPR: GitPR | null
  inRevision?: boolean
  createdAt: string
  updatedAt: string
}

export type AppView = 'backlog' | 'editor' | 'components'

export type EditorTab = 'form' | 'yaml'
