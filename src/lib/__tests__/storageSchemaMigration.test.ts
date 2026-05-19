import { describe, expect, it } from 'vitest'
import type { DataContract } from '@/types/odcs'

/** Minimal legacy contract shape (pre ODCS name / classification fields). */
function legacyContract(): DataContract {
  return {
    uid: 'legacy-1',
    dataContractSpecification: '3.1.0',
    id: 'legacy-contract-a1b2c3d4',
    info: {
      title: 'Legacy',
      version: '1.0.0',
      domain: '',
      owner: '',
      description: '',
      status: 'draft',
      tags: [],
    },
    dataset: [{
      id: 'tbl-legacy',
      physicalName: 'Legacy_Table',
      quantumName: '',
      tableType: 'view',
      description: '',
      columns: [{
        id: 'legacy_col_prop',
        physicalName: 'COL_X',
        logicalName: '',
        physicalType: 'INT',
        logicalType: 'integer',
        required: false,
        isPrimaryKey: false,
        isPII: true,
        isUnique: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      }],
    } as unknown as DataContract['dataset'][0]],
    stakeholders: [],
    roles: [],
    slaProperties: [],
    customProperties: [],
    gitHistory: [],
    openPR: null,
    createdAt: '',
    updatedAt: '',
  }
}

describe('storage schema ODCS migration', () => {
  it('migrates legacy table/column via loadContracts pipeline', async () => {
    const { migrateTableOdcsFields, migrateColumnOdcsFields } = await import('@/lib/schemaOdcsMapping')
    const raw = legacyContract().dataset[0]
    const table = migrateTableOdcsFields({
      ...raw,
      columns: raw.columns.map(c => migrateColumnOdcsFields(c as never)),
    })
    expect(table.name).toBe('legacy_table')
    expect(table.physicalType).toBe('view')
    expect(table.columns[0].name).toBe('col_x')
    expect(table.columns[0].classification).toBe('confidential')
    expect(table.columns[0].criticalDataElement).toBe(false)
  })
})
