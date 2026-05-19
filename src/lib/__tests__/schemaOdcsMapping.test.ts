import { describe, expect, it } from 'vitest'
import type { ColumnDefinition, SchemaTable } from '@/types/odcs'
import {
  applyPropertyBooleanExportFlags,
  classificationImpliesPii,
  migrateTableOdcsFields,
  normalizeOdcsName,
  resolvePropertyClassification,
  resolvePropertyOdcsFields,
  resolveTableOdcsFields,
  syncClassificationFromPii,
} from '@/lib/schemaOdcsMapping'

function minimalTable(overrides: Partial<SchemaTable> = {}): SchemaTable {
  return {
    id: 'tbl-orders',
    name: '',
    physicalName: 'orders',
    quantumName: 'Orders Table',
    tableType: 'table',
    physicalType: 'table',
    description: '',
    columns: [],
    ...overrides,
  }
}

function minimalColumn(overrides: Partial<ColumnDefinition> = {}): ColumnDefinition {
  return {
    id: 'col1',
    name: '',
    physicalName: 'TXN_REF_DT',
    logicalName: 'Transaction date',
    physicalType: 'DATE',
    logicalType: 'date',
    required: false,
    isPrimaryKey: false,
    isPII: false,
    isUnique: false,
    criticalDataElement: false,
    description: '',
    examples: [],
    qualityRule: '',
    isUnknownType: false,
    ...overrides,
  }
}

describe('schemaOdcsMapping', () => {
  it('normalizes physical names to ODCS name', () => {
    expect(normalizeOdcsName('TXN_REF_DT')).toBe('txn_ref_dt')
    expect(normalizeOdcsName('Order Id')).toBe('order_id')
  })

  it('resolves table ODCS fields with businessName from quantumName', () => {
    const resolved = resolveTableOdcsFields(minimalTable())
    expect(resolved.name).toBe('orders')
    expect(resolved.physicalName).toBe('orders')
    expect(resolved.physicalType).toBe('table')
    expect(resolved.businessName).toBe('Orders Table')
  })

  it('resolves property classification from isPII when unset', () => {
    const col = minimalColumn({ isPII: true })
    expect(resolvePropertyClassification(col)).toBe('confidential')
  })

  it('omits public classification on export resolution', () => {
    const col = minimalColumn({ classification: 'public' })
    expect(resolvePropertyClassification(col)).toBeUndefined()
  })

  it('applyPropertyBooleanExportFlags omits false booleans', () => {
    const resolved = resolvePropertyOdcsFields(minimalColumn())
    const target: Record<string, unknown> = {}
    applyPropertyBooleanExportFlags(target, resolved)
    expect(target.primaryKey).toBeUndefined()
    expect(target.unique).toBeUndefined()
    expect(target.criticalDataElement).toBeUndefined()
  })

  it('exports true primaryKey unique and criticalDataElement', () => {
    const resolved = resolvePropertyOdcsFields(minimalColumn({
      isPrimaryKey: true,
      isUnique: true,
      criticalDataElement: true,
    }))
    const target: Record<string, unknown> = {}
    applyPropertyBooleanExportFlags(target, resolved)
    expect(target.primaryKey).toBe(true)
    expect(target.unique).toBe(true)
    expect(target.criticalDataElement).toBe(true)
  })

  it('migrates legacy table and column without ODCS fields', () => {
    const legacy = {
      id: 'tbl-x',
      physicalName: 'My_Table',
      quantumName: '',
      tableType: 'view' as const,
      description: '',
      columns: [{
        id: 'c1',
        physicalName: 'COL_A',
        logicalName: '',
        physicalType: 'VARCHAR',
        logicalType: 'string' as const,
        required: false,
        isPrimaryKey: false,
        isPII: true,
        isUnique: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      }],
    } as unknown as SchemaTable

    const migrated = migrateTableOdcsFields(legacy)
    expect(migrated.name).toBe('my_table')
    expect(migrated.physicalType).toBe('view')
    expect(migrated.columns[0].name).toBe('col_a')
    expect(migrated.columns[0].classification).toBe('confidential')
    expect(migrated.columns[0].criticalDataElement).toBe(false)
  })

  it('syncClassificationFromPii clears confidential when PII off', () => {
    expect(syncClassificationFromPii(false, 'confidential')).toBeUndefined()
    expect(syncClassificationFromPii(true, undefined)).toBe('confidential')
    expect(classificationImpliesPii('restricted')).toBe(false)
  })
})
