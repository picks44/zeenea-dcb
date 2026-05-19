import { DataContract, ColumnDefinition, DataContractSnapshot, SchemaTable, Stakeholder, SlaProperty } from '@/types/odcs'
import type { AuthoritativeDefinition, CustomProperty } from '@/types/odcsShared'
import { LIFECYCLE_STATUSES } from '@/lib/p1Constants'
import {
  ensureQualityRuleIds,
  migrateExamplesField,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import {
  deriveContractId,
  isHybridContractId,
  isLegacySlugOnlyContractId,
  stablePropertyId,
  stableSchemaId,
} from '@/lib/idDerivation'
import { generateId } from '@/lib/utils'
import { migrateGitCommit } from '@/lib/versionHistory'
import { SEED_CONTRACTS } from './seedContracts'

const STORAGE_KEY = 'data-contracts-v1'

function migrateLifecycleStatus(status: string | undefined): DataContract['info']['status'] {
  if (status && (LIFECYCLE_STATUSES as readonly string[]).includes(status)) {
    return status as DataContract['info']['status']
  }
  if (status === 'draft' || status === 'active' || status === 'deprecated') {
    return status
  }
  return 'draft'
}

function migrateSlaRow(row: SlaProperty & { property?: string }): SlaProperty {
  const legacy = row as SlaProperty & { property?: string }
  return {
    id: legacy.id ?? generateId(),
    value: legacy.value ?? '',
    unit: legacy.unit,
    element: legacy.element,
    driver: legacy.driver,
    description: legacy.description,
  }
}

function migrateCustomProperty(row: Partial<CustomProperty>): CustomProperty {
  return {
    id: row.id ?? generateId(),
    property: row.property ?? '',
    value: row.value ?? '',
    description: row.description,
  }
}

function migrateAuthoritativeDefinitions(
  defs: AuthoritativeDefinition[] | undefined,
): AuthoritativeDefinition[] {
  return (defs ?? []).map(d => ({
    id: d.id ?? generateId(),
    url: d.url ?? '',
    type: d.type ?? '',
    description: d.description,
  }))
}

function migrateColumn(col: ColumnDefinition, schemaId: string): ColumnDefinition {
  const id = col.id?.trim() && col.id.includes('_prop')
    ? col.id
    : stablePropertyId(schemaId, col.physicalName)

  const next: ColumnDefinition = {
    ...col,
    id,
    examples: migrateExamplesField(col.examples as string | string[] | undefined),
    tags: normalizeTags(col.tags),
    authoritativeDefinitions: migrateAuthoritativeDefinitions(col.authoritativeDefinitions),
    quality: ensureQualityRuleIds(col.quality ?? []).map(r => ({
      ...r,
      aiVerified: r.aiVerified ?? false,
    })),
    items: col.items,
  }

  if (col.qualityRule?.trim() && !(next.quality ?? []).length) {
    next.quality = ensureQualityRuleIds([{
      id,
      type: 'text',
      description: col.qualityRule.trim(),
      aiVerified: false,
    }])
  }

  return next
}

function migrateTable(table: SchemaTable): SchemaTable {
  const id = table.id?.trim() && table.id.startsWith('tbl-')
    ? table.id
    : stableSchemaId(table.physicalName)

  return {
    ...table,
    id,
    tags: normalizeTags(table.tags),
    quality: ensureQualityRuleIds(table.quality ?? []).map(r => ({
      ...r,
      aiVerified: r.aiVerified ?? false,
    })),
    authoritativeDefinitions: migrateAuthoritativeDefinitions(table.authoritativeDefinitions),
    columns: (table.columns ?? []).map(c => migrateColumn(c, id)),
    relationships: table.relationships ?? [],
  }
}

function migrateStakeholder(s: Stakeholder): Stakeholder {
  return {
    id: s.id ?? generateId(),
    name: s.name ?? '',
    role: s.role ?? 'Data Consumer',
    email: s.email ?? '',
    team: s.team ?? '',
    notes: s.notes ?? '',
  }
}

function migrateInfo(info: DataContract['info']): DataContract['info'] {
  return {
    ...info,
    status: migrateLifecycleStatus(info.status),
    tags: normalizeTags(info.tags),
    descriptionAuthoritativeDefinitions: migrateAuthoritativeDefinitions(
      info.descriptionAuthoritativeDefinitions,
    ),
  }
}

function migrateSnapshot(snapshot: DataContractSnapshot): DataContractSnapshot {
  return {
    ...snapshot,
    info: migrateInfo(snapshot.info),
    stakeholders: (snapshot.stakeholders ?? []).map(migrateStakeholder),
    roles: snapshot.roles ?? [],
    slaProperties: (snapshot.slaProperties ?? []).map(migrateSlaRow),
    customProperties: (snapshot.customProperties ?? []).map(migrateCustomProperty),
    dataset: (snapshot.dataset ?? []).map(migrateTable),
  }
}

function migrateContractId(c: DataContract, title: string): string {
  const current = c.id?.trim() || ''
  const expected = deriveContractId(title || 'contract', c.uid)
  if (!current) return expected
  if (isLegacySlugOnlyContractId(current, title)) return expected
  if (!isHybridContractId(current)) return expected
  if (current !== expected) return expected
  return current
}

function migrateContract(c: DataContract): DataContract {
  const info = migrateInfo(c.info)
  const title = info.title?.trim() || ''
  const id = migrateContractId(c, title)

  return {
    ...c,
    id,
    info,
    customProperties: (c.customProperties ?? []).map(migrateCustomProperty),
    collaborators: c.collaborators ?? [],
    stakeholders: (c.stakeholders ?? []).map(migrateStakeholder),
    roles: c.roles ?? [],
    slaProperties: (c.slaProperties ?? []).map(migrateSlaRow),
    gitHistory: (c.gitHistory ?? []).map(commit => {
      const migrated = migrateGitCommit(commit, c.info.title)
      return {
        ...migrated,
        contractStatus: migrateLifecycleStatus(migrated.contractStatus),
        snapshot: commit.snapshot ? migrateSnapshot(commit.snapshot) : undefined,
      }
    }),
    dataset: (c.dataset ?? []).map(migrateTable),
    openPR: c.openPR ?? null,
  }
}

export function loadContracts(): DataContract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_CONTRACTS.map(migrateContract)
    const contracts: DataContract[] = JSON.parse(raw)
    return contracts.map(migrateContract)
  } catch {
    return SEED_CONTRACTS.map(migrateContract)
  }
}

export function saveContracts(contracts: DataContract[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts))
  } catch {
    // quota exceeded — silently ignore in prototype
  }
}
