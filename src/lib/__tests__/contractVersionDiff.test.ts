import { describe, expect, it } from 'vitest'
import { createContract } from '@/lib/createContract'
import { buildP1FixtureContract } from './p1-fixture'
import {
  buildPublishChangelog,
  compareContractVersions,
  hasAnyChangeSinceLastPublish,
  summarizeChangesSince,
} from '@/lib/contractVersionDiff'
import { contractToComparisonSnapshot as toSnapshot } from '@/lib/exportedContractDiff'
import type { DataContract, DataContractSnapshot, GitCommit } from '@/types/odcs'

function withHistory(contract: DataContract, snapshot: DataContractSnapshot, version = '1.0.0'): DataContract {
  const commit: GitCommit = {
    hash: 'abc123',
    title: `Update to v${version}`,
    changelog: '',
    timestamp: '2024-01-01T00:00:00.000Z',
    version,
    contractStatus: 'active',
    snapshot,
  }
  return {
    ...contract,
    info: { ...contract.info, version, status: 'active' },
    gitHistory: [commit],
    inRevision: true,
    updatedAt: '2024-06-01T00:00:00.000Z',
  }
}

function baseSnapshot(contract: DataContract): DataContractSnapshot {
  return toSnapshot({ ...contract, info: { ...contract.info, status: 'active', version: '1.0.0' } })
}

describe('contractToComparisonSnapshot', () => {
  it('includes customProperties for export comparison', () => {
    const contract = buildP1FixtureContract()
    const snap = toSnapshot(contract)
    expect(snap.customProperties).toHaveLength(1)
    expect(snap.customProperties![0].property).toBe('dataSteward')
  })
})

describe('hasAnyChangeSinceLastPublish', () => {
  it('returns true when there is no prior snapshot (first publish)', () => {
    const contract = createContract('manual')
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(true)
  })

  it('returns false when export and governance are unchanged', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory({ ...base, updatedAt: '2024-06-01T00:00:00.000Z' }, snap)
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(false)
  })

  it('returns true when only contract owner changes', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory(
      { ...base, info: { ...base.info, owner: 'New Owner' }, updatedAt: '2024-06-01T00:00:00.000Z' },
      snap,
    )
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(true)
  })

  it('returns true when only governance contacts change', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory(
      {
        ...base,
        stakeholders: [{ id: 's1', name: 'Jane', role: 'Privacy', email: '', team: '', notes: '' }],
        updatedAt: '2024-06-01T00:00:00.000Z',
      },
      snap,
    )
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(true)
  })

  it('returns false when only collaborators change', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory(
      {
        ...base,
        collaborators: [{ id: 'c1', name: 'Bob', email: 'b@x.com', role: 'editor', invitedAt: '2024-01-01' }],
        updatedAt: '2024-06-01T00:00:00.000Z',
      },
      snap,
    )
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(false)
  })

  it('returns false when only version/status differ in export (publish system fields)', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory(
      {
        ...base,
        info: { ...base.info, version: '2.0.0', status: 'draft' },
        updatedAt: '2024-06-01T00:00:00.000Z',
      },
      snap,
    )
    expect(hasAnyChangeSinceLastPublish(contract)).toBe(false)
  })
})

describe('compareContractVersions / buildPublishChangelog', () => {
  it('detects custom property added', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot({ ...base, customProperties: [] })
    const current = toSnapshot(base)
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(comparison.exportDiff.customProperties.added).toBe(1)
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/custom propert/i)
  })

  it('detects custom property value updated', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const current = toSnapshot({
      ...base,
      customProperties: [{ ...base.customProperties[0], value: 'new@example.com' }],
    })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toMatch(/custom propert/i)
  })

  it('detects custom property removed', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const current = toSnapshot({ ...base, customProperties: [] })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.exportDiff.customProperties.removed).toBe(1)
    expect(buildPublishChangelog(comparison)).toMatch(/custom propert/i)
  })

  it('detects data access role changes', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot({ ...base, roles: [] })
    const current = toSnapshot({
      ...base,
      roles: [{ id: 'r1', role: 'analyst', access: 'read', description: '' }],
    })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toMatch(/access role/i)
  })

  it('detects SLA changes', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot({ ...base, slaProperties: [] })
    const current = toSnapshot(base)
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toMatch(/service level/i)
  })

  it('detects schema field classification change', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const dataset = JSON.parse(JSON.stringify(base.dataset)) as typeof base.dataset
    dataset[0].columns[0].classification = 'restricted'
    const current = toSnapshot({ ...base, dataset })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(comparison.exportDiff.schema.updated).toBeGreaterThan(0)
  })

  it('detects schema businessName change', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const dataset = JSON.parse(JSON.stringify(base.dataset)) as typeof base.dataset
    dataset[0].columns[0].logicalName = 'Renamed Column'
    const current = toSnapshot({ ...base, dataset })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
  })

  it('detects exported fundamentals change (domain)', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const current = toSnapshot({ ...base, info: { ...base.info, domain: 'payments' } })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toMatch(/domain/i)
  })

  it('owner only produces governance changelog', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const current = toSnapshot({ ...base, info: { ...base.info, owner: 'Privacy Office' } })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(false)
    expect(comparison.hasGovernanceChange).toBe(true)
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toBe('Updated contract owner')
    expect(changelog).not.toMatch(/No contract changes/i)
  })

  it('contacts only produce governance changelog', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const current = toSnapshot({
      ...base,
      stakeholders: [{ id: 's1', name: 'Ops', role: 'Owner', email: 'ops@co.com', team: '', notes: '' }],
    })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasGovernanceChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toBe('Updated governance contacts')
  })

  it('mixed schema and governance changelog', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const dataset = JSON.parse(JSON.stringify(base.dataset)) as typeof base.dataset
    dataset[0].columns[0].description = 'Updated desc'
    const current = toSnapshot({
      ...base,
      dataset,
      stakeholders: [{ id: 's1', name: 'Ops', role: 'Owner', email: '', team: '', notes: '' }],
    })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(comparison.hasGovernanceChange).toBe(true)
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/field|schema|Updated/i)
    expect(changelog).toMatch(/governance contacts/i)
  })

  it('customProperties + owner mixed changelog', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot({ ...base, customProperties: [] })
    const current = toSnapshot({
      ...base,
      info: { ...base.info, owner: 'New Owner' },
    })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasAnyChange).toBe(true)
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/custom propert/i)
    expect(changelog).toMatch(/contract owner/i)
  })

  it('returns empty changelog when no changes', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const comparison = summarizeChangesSince(
      { ...base, updatedAt: '2024-06-01T00:00:00.000Z' },
      snap,
    )
    expect(comparison.hasAnyChange).toBe(false)
    expect(buildPublishChangelog(comparison)).toBe('')
  })
})
