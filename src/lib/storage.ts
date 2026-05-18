import { DataContract, ColumnDefinition, DataContractSnapshot, SchemaTable } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { SEED_CONTRACTS } from './seedContracts'

const STORAGE_KEY = 'data-contracts-v1'

function migrateColumn(col: ColumnDefinition): ColumnDefinition {
  const next = { ...col }
  if (col.qualityRule?.trim() && !(col.quality ?? []).length) {
    next.quality = [{
      id: col.id || generateId(),
      type: 'text',
      description: col.qualityRule.trim(),
    }]
  }
  return next
}

function migrateTable(table: SchemaTable): SchemaTable {
  return {
    ...table,
    columns: (table.columns ?? []).map(migrateColumn),
    relationships: table.relationships ?? [],
  }
}

function migrateSnapshot(snapshot: DataContractSnapshot): DataContractSnapshot {
  return {
    ...snapshot,
    stakeholders: snapshot.stakeholders ?? [],
    roles: snapshot.roles ?? [],
    slaProperties: snapshot.slaProperties ?? [],
    dataset: (snapshot.dataset ?? []).map(migrateTable),
  }
}

function migrateContract(c: DataContract): DataContract {
  return {
    ...c,
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
