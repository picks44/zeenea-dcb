import { DataContract } from '@/types/odcs'
import { SEED_CONTRACTS } from './seedContracts'

const STORAGE_KEY = 'data-contracts-v1'

export function loadContracts(): DataContract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_CONTRACTS
    const contracts: DataContract[] = JSON.parse(raw)
    return contracts.map(c => ({
      ...c,
      gitHistory: c.gitHistory ?? [],
      openPR: c.openPR ?? null,
    }))
  } catch {
    return SEED_CONTRACTS
  }
}

export function saveContracts(contracts: DataContract[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts))
  } catch {
    // quota exceeded — silently ignore in prototype
  }
}
