import { describe, expect, it } from 'vitest'
import type { SchemaTable } from '@/types/odcs'
import { migrateTableOdcsFields } from '@/lib/schemaOdcsMapping'
import {
  isForeignKeyTargetMissing,
  syncDatasetAfterTableDelete,
  syncDatasetAfterTableUpdate,
} from '@/lib/schemaRelationshipRefs'

function col(id: string, physicalName: string, fk?: { toTable: string; toColumn: string }) {
  return {
    id,
    physicalName,
    logicalName: physicalName,
    name: physicalName,
    physicalType: 'UUID',
    logicalType: 'string' as const,
    required: false,
    isPrimaryKey: false,
    isPII: false,
    isUnique: false,
    criticalDataElement: false,
    description: '',
    examples: [],
    qualityRule: '',
    isUnknownType: false,
    ...(fk ? { foreignKey: fk } : {}),
  }
}

function table(
  physicalName: string,
  columns: ReturnType<typeof col>[],
  relationships?: SchemaTable['relationships'],
): SchemaTable {
  return migrateTableOdcsFields({
    id: `tbl-${physicalName}`,
    physicalName,
    name: physicalName,
    quantumName: physicalName,
    tableType: 'table',
    physicalType: 'table',
    description: '',
    columns,
    relationships,
  } as unknown as SchemaTable)
}

describe('schemaRelationshipRefs', () => {
  it('rewrites inbound FK toTable when referenced table is renamed', () => {
    const customers = table('customers', [col('c1', 'id')])
    const orders = table('orders', [col('o1', 'customer_id', { toTable: 'customers', toColumn: 'id' })])
    const tables = [orders, customers]

    const renamedCustomers = { ...customers, physicalName: 'clients', name: 'clients' }
    const next = syncDatasetAfterTableUpdate(tables, 1, customers, renamedCustomers)

    expect(next[0].columns[0].foreignKey).toEqual({ toTable: 'clients', toColumn: 'id' })
  })

  it('rewrites toColumn when referenced column is renamed', () => {
    const customers = table('customers', [col('c1', 'id')])
    const orders = table('orders', [col('o1', 'customer_id', { toTable: 'customers', toColumn: 'id' })])
    const tables = [orders, customers]

    const updatedCustomers = {
      ...customers,
      columns: customers.columns.map(c =>
        c.id === 'c1' ? { ...c, physicalName: 'customer_id', name: 'customer_id' } : c,
      ),
    }
    const next = syncDatasetAfterTableUpdate(tables, 1, customers, updatedCustomers)

    expect(next[0].columns[0].foreignKey).toEqual({ toTable: 'customers', toColumn: 'customer_id' })
  })

  it('clears FK when referenced table is deleted', () => {
    const orders = table('orders', [col('o1', 'customer_id', { toTable: 'customers', toColumn: 'id' })])

    const next = syncDatasetAfterTableDelete([orders], 'customers')

    expect(next[0].columns[0].foreignKey).toBeUndefined()
  })

  it('updates composite relationship column lists on rename', () => {
    const target = table('target', [col('t1', 'a'), col('t2', 'b')])
    const source = table('source', [col('s1', 'x'), col('s2', 'y')], [{
      id: 'rel1',
      toTable: 'target',
      type: 'composite_foreign_key',
      fromColumns: ['x', 'y'],
      toColumns: ['a', 'b'],
    }])
    const tables = [source, target]

    const updatedSource = {
      ...source,
      columns: source.columns.map(c =>
        c.physicalName === 'x' ? { ...c, physicalName: 'x_id', name: 'x_id' } : c,
      ),
    }
    const next = syncDatasetAfterTableUpdate(tables, 0, source, updatedSource)

    expect(next[0].relationships?.[0].fromColumns).toEqual(['x_id', 'y'])
  })

  it('detects missing FK target', () => {
    const customers = table('customers', [col('c1', 'id')])
    expect(isForeignKeyTargetMissing({ toTable: 'customers', toColumn: 'missing' }, [customers])).toBe(true)
    expect(isForeignKeyTargetMissing({ toTable: 'customers', toColumn: 'id' }, [customers])).toBe(false)
  })
})
