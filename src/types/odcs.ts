import type { AuthoritativeDefinition, CustomProperty } from "./odcsShared";
import type {
  ClassificationValue,
  OdcsLifecycleStatus,
  OdcsLogicalType,
  QualityDimension,
  RoleAccess,
  SchemaPhysicalType,
  SlaPropertyType,
} from "@/lib/p1Constants";

export type { AuthoritativeDefinition, CustomProperty } from "./odcsShared";

export type LifecycleStatus = OdcsLifecycleStatus;

/** ODCS-exportable logical types plus app-only `unknown` (DDL import). */
export type LogicalType = OdcsLogicalType | "unknown";

export type { ClassificationValue, OdcsLogicalType, SchemaPhysicalType };

export type SectionId =
  | "import"
  | "fundamentals"
  | "schema"
  | "versions"
  | "stakeholders"
  | "accessRoles"
  | "terms"
  | "servers"
  | "team"
  | "sla"
  | "pricing"
  | "custom"
  | "collaboration"
  | "tests";

export type { QualityDimension, SlaPropertyType };

export interface QualityRule {
  id: string;
  name?: string;
  description: string;
  type: "text";
  dimension?: QualityDimension;
  severity?: string;
  businessImpact?: string;
  /** P1 MVP: quality rules must be verified by AI before publish. */
  aiVerified?: boolean;
}

export type ArrayItemLogicalType = "string" | "object";

export interface PropertyItems {
  logicalType: ArrayItemLogicalType;
  /** Nested properties when logicalType is object. */
  properties?: ColumnDefinition[];
}

export interface ColumnDefinition {
  id: string;
  /** ODCS logical property name (normalized, distinct from physicalName). */
  name: string;
  physicalName: string;
  /** App-only column display label; exported as ODCS businessName when set. */
  logicalName: string;
  physicalType: string;
  logicalType: LogicalType;
  required: boolean;
  isPrimaryKey: boolean;
  /** App-only personal-data flag; syncs with classification in UI. Not exported to YAML. */
  isPII: boolean;
  isUnique: boolean;
  /** ODCS sensitivity classification (exported; omit when public/unset). */
  classification?: ClassificationValue;
  /** ODCS Critical Data Element flag (exported when true). */
  criticalDataElement: boolean;
  description: string;
  examples: string[];
  qualityRule: string;
  quality?: QualityRule[];
  tags?: string[];
  authoritativeDefinitions?: AuthoritativeDefinition[];
  isUnknownType: boolean;
  /** Only when logicalType is array (P1). */
  items?: PropertyItems;
  /** Single-column foreign key - exported on this property in ODCS YAML. */
  foreignKey?: ColumnForeignKey;
}

export interface ColumnForeignKey {
  toTable: string;
  toColumn: string;
}

export type RelationshipType =
  | "has_one"
  | "has_many"
  | "belongs_to"
  | "many_to_many"
  | "composite_foreign_key";

export interface TableRelationship {
  id: string;
  toTable: string;
  type: RelationshipType;
  /** Legacy single-column belongs_to - prefer `ColumnDefinition.foreignKey`. */
  fromColumn?: string;
  toColumn?: string;
  /** Composite FK - exported at table/object level (2+ column pairs). */
  fromColumns?: string[];
  toColumns?: string[];
}

export interface SchemaTable {
  id: string;
  /** ODCS schema object name (normalized, distinct from physicalName). */
  name: string;
  physicalName: string;
  /** App-only entity display name; exported as ODCS businessName when set. */
  quantumName: string;
  /** App UI mirror of physicalType (table/view); kept for backward compatibility. */
  tableType: "table" | "view" | "topic" | "file";
  /** ODCS schema object physical type. */
  physicalType: SchemaPhysicalType;
  description: string;
  columns: ColumnDefinition[];
  relationships?: TableRelationship[];
  tags?: string[];
  quality?: QualityRule[];
  authoritativeDefinitions?: AuthoritativeDefinition[];
}

export interface ContractInfo {
  title: string;
  version: string;
  domain: string;
  owner: string;
  description: string;
  status: LifecycleStatus;
  tags: string[];
  descriptionUsage?: string;
  descriptionLimitations?: string;
  descriptionAuthoritativeDefinitions?: AuthoritativeDefinition[];
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  team: string;
  /** Optional governance context (not in ODCS YAML). */
  notes: string;
}

export interface OdcsAccessRole {
  id: string;
  role: string;
  access: RoleAccess;
  description?: string;
}

export interface SlaProperty {
  id: string;
  /** ODCS SLA type; required at publish when the row has any content. */
  property?: SlaPropertyType;
  value: string;
  unit?: string;
  element?: string;
  driver?: string;
  description?: string;
}

export type CollaboratorRole = "owner" | "editor" | "viewer";

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  invitedAt: string;
}

export interface DataContractSnapshot {
  id: string;
  info: ContractInfo;
  dataset: SchemaTable[];
  stakeholders: Stakeholder[];
  roles?: OdcsAccessRole[];
  slaProperties?: SlaProperty[];
  customProperties?: CustomProperty[];
  collaborators?: Collaborator[];
}

export interface GitCommit {
  hash: string;
  /** Stable timeline title, e.g. "Update to v1.2.0" */
  title?: string;
  /** Multiline changelog from the publish modal ("What changed?") */
  changelog?: string;
  /** @deprecated use title + changelog - kept for localStorage migration */
  message?: string;
  timestamp: string;
  version: string;
  contractStatus: LifecycleStatus;
  prNumber?: number;
  snapshot?: DataContractSnapshot;
}

export interface GitPR {
  number: number;
  title: string;
  branch: string;
  commitHash: string;
  createdAt: string;
  mergedAt?: string;
  status: "open" | "merged";
}

/** How the contract was created - UI-only, not exported to ODCS YAML. */
export type ContractCreationSource = "manual" | "import";

export interface DataContract {
  uid: string;
  dataContractSpecification: "3.1.0";
  id: string;
  info: ContractInfo;
  dataset: SchemaTable[];
  stakeholders: Stakeholder[];
  roles: OdcsAccessRole[];
  slaProperties: SlaProperty[];
  customProperties: CustomProperty[];
  collaborators?: Collaborator[];
  gitHistory: GitCommit[];
  openPR: GitPR | null;
  inRevision?: boolean;
  /** UI-only: distinguishes scratch vs import onboarding (not in YAML export). */
  creationSource?: ContractCreationSource;
  createdAt: string;
  updatedAt: string;
}

export type AppView = "backlog" | "create" | "editor" | "components";

export type EditorTab = "form" | "yaml";
