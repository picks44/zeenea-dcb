import { DataContract, ColumnDefinition, DataContractSnapshot, SchemaTable } from '@/types/odcs'
import type { AuthoritativeDefinition } from '@/types/odcsShared'
import {
  ensureQualityRuleIds,
  migrateExamplesField,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import { generateId } from '@/lib/utils'
import { SEED_CONTRACTS } from './seedContracts'

const STORAGE_KEY = 'data-contracts-v1'

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

function migrateColumn(col: ColumnDefinition): ColumnDefinition {
  const next: ColumnDefinition = {
    ...col,
    examples: migrateExamplesField(col.examples as string | string[] | undefined),
    tags: normalizeTags(col.tags),
    authoritativeDefinitions: migrateAuthoritativeDefinitions(col.authoritativeDefinitions),
    quality: ensureQualityRuleIds(col.quality ?? []),
  }

  if (col.qualityRule?.trim() && !(next.quality ?? []).length) {
    next.quality = ensureQualityRuleIds([{
      id: col.id || generateId(),
      type: 'text',
      description: col.qualityRule.trim(),
    }])
  }

  return next
}

function migrateTable(table: SchemaTable): SchemaTable {
  return {
    ...table,
    id: table.id ?? generateId(),
    tags: normalizeTags(table.tags),
    quality: ensureQualityRuleIds(table.quality ?? []),
    authoritativeDefinitions: migrateAuthoritativeDefinitions(table.authoritativeDefinitions),
    columns: (table.columns ?? []).map(migrateColumn),
    relationships: table.relationships ?? [],
  }
}

function migrateInfo(info: DataContract['info']): DataContract['info'] {
  return {
    ...info,
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
    stakeholders: snapshot.stakeholders ?? [],
    roles: snapshot.roles ?? [],
    slaProperties: snapshot.slaProperties ?? [],
    dataset: (snapshot.dataset ?? []).map(migrateTable),
  }
}

function migrateContract(c: DataContract): DataContract {
  return {
    ...c,
    info: migrateInfo(c.info),
    collaborators: c.collaborators ?? [],
    stakeholders: c.stakeholders ?? [],
    roles: c.roles ?? [],
    slaProperties: c.slaProperties ?? [],
    gitHistory: (c.gitHistory ?? []).map(commit => ({
      ...commit,
      snapshot: commit.snapshot ? migrateSnapshot(commit.snapshot) : undefined,
    })),
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
