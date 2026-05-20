import { describe, expect, it } from 'vitest'
import { createContract, createContractWithImportedSchema } from '@/lib/createContract'
import { buildP1FixtureContract } from './p1-fixture'
import {
  buildDefaultPublishChangelog,
  buildFirstPublishChangelog,
  buildPublishChangelog,
  buildWorkingCopySummaryLines,
  compareContractVersions,
  hasAnyChangeSinceLastPublish,
  summarizeChangesSince,
} from '@/lib/contractVersionDiff'
import { contractToComparisonSnapshot as toSnapshot } from '@/lib/exportedContractDiff'
import { getDisplayChangelog } from '@/lib/versionHistory'
import type { DataContract, DataContractSnapshot, GitCommit, SchemaTable } from '@/types/odcs'
import { migrateTableOdcsFields } from '@/lib/schemaOdcsMapping'

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

describe('buildFirstPublishChangelog', () => {
  it('describes imported schema with tables and field count', () => {
    const templateTable = JSON.parse(
      JSON.stringify(buildP1FixtureContract().dataset[0]),
    ) as SchemaTable
    const templateCol = templateTable.columns[0]
    const col = (id: string, name: string) => ({
      ...templateCol,
      id,
      name,
      physicalName: name,
      logicalName: name,
    })
    const table = migrateTableOdcsFields({
      ...templateTable,
      name: 'customers',
      physicalName: 'customers',
      quantumName: 'Customers',
      columns: [col('c1', 'id'), col('c2', 'email')],
    })
    const orders = migrateTableOdcsFields({
      ...templateTable,
      name: 'orders',
      physicalName: 'orders',
      quantumName: 'Orders',
      columns: [col('o1', 'order_id')],
    })
    const contract = createContractWithImportedSchema([table, orders])
    contract.info.title = 'Customer Analytics'
    contract.info.owner = 'Data Governance Office'

    const changelog = buildFirstPublishChangelog(contract)
    expect(changelog).toMatch(/initial publication/i)
    expect(changelog).toMatch(/Customer Analytics/i)
    expect(changelog).toMatch(/DDL/i)
    expect(changelog).toMatch(/customers|orders/i)
    expect(changelog).toMatch(/3 field/i)
    expect(changelog).toMatch(/Data Governance Office/i)
  })

  it('manual contract does not mention DDL import', () => {
    const contract = createContract('manual')
    contract.info.title = 'Empty Draft'
    const changelog = buildFirstPublishChangelog(contract)
    expect(changelog).toMatch(/initial publication/i)
    expect(changelog).not.toMatch(/DDL/i)
    expect(changelog).toMatch(/manual|no schema/i)
  })
})

describe('buildDefaultPublishChangelog', () => {
  it('returns non-empty default for first publish', () => {
    const contract = createContract('manual')
    contract.info.title = 'My Contract'
    expect(buildDefaultPublishChangelog(contract).trim().length).toBeGreaterThan(0)
  })

  it('uses subsequent changelog when history exists', () => {
    const base = buildP1FixtureContract()
    const snap = baseSnapshot(base)
    const contract = withHistory(
      { ...base, info: { ...base.info, owner: 'Privacy Office' }, updatedAt: '2024-06-01T00:00:00.000Z' },
      snap,
    )
    const changelog = buildDefaultPublishChangelog(contract)
    expect(changelog).toMatch(/governance-only/i)
    expect(changelog).toMatch(/contract owner/i)
  })

  it('empty user input can fall back to default (publish path)', () => {
    const contract = createContract('manual')
    contract.info.title = 'Fallback Test'
    const userInput = '   '
    const resolved = userInput.trim() || buildDefaultPublishChangelog(contract)
    expect(resolved).toMatch(/initial publication/i)
    expect(resolved.length).toBeGreaterThan(0)
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
    expect(changelog.split('\n').length).toBeLessThanOrEqual(12)
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
    expect(buildPublishChangelog(comparison)).toMatch(/dataSteward|custom propert/i)
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
    expect(buildPublishChangelog(comparison)).toMatch(/data access role/i)
  })

  it('detects SLA changes', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot({ ...base, slaProperties: [] })
    const current = toSnapshot(base)
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(buildPublishChangelog(comparison)).toMatch(/service level/i)
  })

  it('detects schema field classification change with grouped wording', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const dataset = JSON.parse(JSON.stringify(base.dataset)) as typeof base.dataset
    dataset[0].columns[0].classification = 'restricted'
    const current = toSnapshot({ ...base, dataset })
    const comparison = compareContractVersions(previous, current)
    expect(comparison.hasExportChange).toBe(true)
    expect(comparison.exportDiff.schema.updated).toBeGreaterThan(0)
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/orders/i)
    expect(changelog).not.toMatch(/^Updated txn_ref_dt field$/m)
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
    expect(comparison.publishChangeKind).toBe('governance_only')
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/governance-only/i)
    expect(changelog).toMatch(/contract owner/i)
    expect(changelog).not.toMatch(/schema|field|YAML|export.*changes/i)
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
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/governance contacts/i)
    expect(changelog).not.toMatch(/schema|export.*changes/i)
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
    expect(comparison.publishChangeKind).toBe('mixed')
    const changelog = buildPublishChangelog(comparison)
    expect(changelog).toMatch(/governance/i)
    expect(changelog).toMatch(/export|schema/i)
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

  it('groups large schema diff instead of one line per field', () => {
    const base = buildP1FixtureContract()
    const previous = baseSnapshot(base)
    const dataset = JSON.parse(JSON.stringify(base.dataset)) as typeof base.dataset
    const table = dataset[0]
    for (let i = 0; i < 6; i++) {
      table.columns.push({
        ...table.columns[0],
        id: `extra_${i}`,
        name: `extra_col_${i}`,
        physicalName: `EXTRA_${i}`,
        logicalName: `Extra ${i}`,
        description: `desc ${i}`,
      })
    }
    const current = toSnapshot({ ...base, dataset })
    const comparison = compareContractVersions(previous, current)
    const changelog = buildPublishChangelog(comparison)
    const lines = changelog.split('\n').filter(Boolean)
    expect(lines.length).toBeLessThanOrEqual(12)
    expect(changelog).toMatch(/orders/i)
    expect(changelog).not.toMatch(/Updated extra_col_0 field/)
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
    expect(buildWorkingCopySummaryLines(comparison)).toEqual([])
  })
})

describe('getDisplayChangelog (legacy)', () => {
  it('shows fallback for initial commit without stored changelog', () => {
    const commit: GitCommit = {
      hash: 'legacy1',
      title: 'Initial version of Seller Payments v1',
      changelog: '',
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
      contractStatus: 'active',
    }
    const display = getDisplayChangelog(commit, 'Seller Payments v1')
    expect(display).toMatch(/initial publication/i)
    expect(display).toMatch(/Seller Payments v1/i)
    expect(display).toMatch(/v1\.0\.0/)
    expect(commit.changelog).toBe('')
  })
})
