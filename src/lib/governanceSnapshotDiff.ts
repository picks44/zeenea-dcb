import type { DataContractSnapshot, Stakeholder } from '@/types/odcs'

export interface ArrayChangeCount {
  added: number
  removed: number
  updated: number
}

export interface GovernanceSnapshotDiff {
  identical: boolean
  ownerChanged: boolean
  stakeholders: ArrayChangeCount
  summaryLines: string[]
}

function stakeholderPayload(s: Stakeholder): string {
  return JSON.stringify({
    name: (s.name ?? '').trim(),
    role: (s.role ?? '').trim(),
    email: (s.email ?? '').trim(),
    team: (s.team ?? '').trim(),
    notes: (s.notes ?? '').trim(),
  })
}

function diffStakeholders(left: Stakeholder[], right: Stakeholder[]): ArrayChangeCount {
  const leftMap = new Map(left.map(s => [s.id, s]))
  const rightMap = new Map(right.map(s => [s.id, s]))
  let added = 0
  let removed = 0
  let updated = 0

  for (const [id, rightRow] of rightMap) {
    const leftRow = leftMap.get(id)
    if (!leftRow) {
      if ((rightRow.name ?? '').trim()) added++
    } else if (stakeholderPayload(leftRow) !== stakeholderPayload(rightRow)) {
      updated++
    }
  }

  for (const [id, leftRow] of leftMap) {
    if (!rightMap.has(id) && (leftRow.name ?? '').trim()) removed++
  }

  return { added, removed, updated }
}

/** App-only governance fields versioned in publish snapshots (not in ODCS YAML). */
export function compareGovernanceSnapshots(
  left: DataContractSnapshot,
  right: DataContractSnapshot,
): GovernanceSnapshotDiff {
  const ownerChanged = (left.info.owner ?? '').trim() !== (right.info.owner ?? '').trim()
  const stakeholders = diffStakeholders(left.stakeholders ?? [], right.stakeholders ?? [])
  const stakeholdersChanged =
    stakeholders.added > 0 || stakeholders.removed > 0 || stakeholders.updated > 0

  const identical = !ownerChanged && !stakeholdersChanged
  const summaryLines: string[] = []

  if (ownerChanged) summaryLines.push('Contract owner updated')
  if (stakeholdersChanged) summaryLines.push('Governance contacts updated')

  return {
    identical,
    ownerChanged,
    stakeholders,
    summaryLines,
  }
}
