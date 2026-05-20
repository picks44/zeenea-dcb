import { describe, expect, it } from 'vitest'
import type { SchemaTable } from '@/types/odcs'
import { migrateTableOdcsFields } from '@/lib/schemaOdcsMapping'
import { buildSchemaLevelRelationships } from '@/lib/relationshipExport'

function table(physicalName: string, extra: Partial<SchemaTable> = {}): SchemaTable {
  return migrateTableOdcsFields({
    id: `tbl-${physicalName}`,
    physicalName,
    name: physicalName,
    quantumName: physicalName,
    tableType: 'table',
    description: '',
    columns: [{
      id: `${physicalName}_id_prop`,
      physicalName: 'id',
      logicalName: 'id',
      name: 'id',
      physicalType: 'UUID',
      logicalType: 'string',
      required: true,
      isPrimaryKey: true,
      isPII: false,
      isUnique: false,
      criticalDataElement: false,
      description: '',
      examples: [],
      qualityRule: '',
      isUnknownType: false,
    }],
    ...extra,
  } as SchemaTable)
}

describe('buildSchemaLevelRelationships', () => {
  const customers = table('customers')
  const orders = table('orders', {
    columns: [
      {
        id: 'tbl_orders_a_prop',
        physicalName: 'a',
        logicalName: 'a',
        name: 'a',
        physicalType: 'UUID',
        logicalType: 'string',
        required: true,
        isPrimaryKey: true,
        isPII: false,
        isUnique: false,
        criticalDataElement: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      },
      {
        id: 'tbl_orders_b_prop',
        physicalName: 'b',
        logicalName: 'b',
        name: 'b',
        physicalType: 'UUID',
        logicalType: 'string',
        required: true,
        isPrimaryKey: false,
        isPII: false,
        isUnique: false,
        criticalDataElement: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      },
    ],
    relationships: [{
      id: 'rel-composite',
      toTable: 'customers',
      type: 'composite_foreign_key',
      fromColumns: ['a', 'b'],
      toColumns: ['id', 'id'],
    }],
  })

  it('exports complete composite foreign key', () => {
    const rels = buildSchemaLevelRelationships(orders, [orders, customers])
    expect(rels).toHaveLength(1)
    expect(rels[0]).toMatchObject({
      type: 'foreignKey',
      from: [
        '/schema/tbl-orders/properties/tbl_orders_a_prop',
        '/schema/tbl-orders/properties/tbl_orders_b_prop',
      ],
      to: [
        '/schema/tbl-customers/properties/customers_id_prop',
        '/schema/tbl-customers/properties/customers_id_prop',
      ],
    })
  })

  it('exports many-to-many with table-level pointers when join columns omitted', () => {
    const bridge = table('order_tags', {
      relationships: [{
        id: 'rel-m2m',
        toTable: 'customers',
        type: 'many_to_many',
      }],
    })
    const rels = buildSchemaLevelRelationships(bridge, [bridge, customers])
    expect(rels).toHaveLength(1)
    expect(rels[0]).toMatchObject({
      type: 'manyToMany',
      from: ['/schema/tbl-order_tags'],
      to: ['/schema/tbl-customers'],
    })
  })

  it('drops unresolved composite FK target pointers when table is missing', () => {
    const orphan = table('orphan', {
      columns: [
        {
          id: 'tbl_orphan_a_prop',
          physicalName: 'a',
          logicalName: 'a',
          name: 'a',
          physicalType: 'UUID',
          logicalType: 'string',
          required: true,
          isPrimaryKey: true,
          isPII: false,
          isUnique: false,
          criticalDataElement: false,
          description: '',
          examples: [],
          qualityRule: '',
          isUnknownType: false,
        },
        {
          id: 'tbl_orphan_b_prop',
          physicalName: 'b',
          logicalName: 'b',
          name: 'b',
          physicalType: 'UUID',
          logicalType: 'string',
          required: true,
          isPrimaryKey: false,
          isPII: false,
          isUnique: false,
          criticalDataElement: false,
          description: '',
          examples: [],
          qualityRule: '',
          isUnknownType: false,
        },
      ],
      relationships: [{
        id: 'rel-bad',
        toTable: 'missing_table',
        type: 'composite_foreign_key',
        fromColumns: ['a', 'b'],
        toColumns: ['x', 'y'],
      }],
    })
    const rels = buildSchemaLevelRelationships(orphan, [orphan])
    expect(rels).toHaveLength(1)
    expect(rels[0].from).toHaveLength(2)
    expect(rels[0].to).toEqual([])
  })
})
