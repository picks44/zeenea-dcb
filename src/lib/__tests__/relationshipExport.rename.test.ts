import { describe, expect, it } from 'vitest'
import { buildPropertyForeignKeys, propertyRelationshipPointer } from '@/lib/relationshipExport'
import type { SchemaTable } from '@/types/odcs'
import { migrateTableOdcsFields } from '@/lib/schemaOdcsMapping'

describe('relationshipExport after physicalName rename', () => {
  it('keeps FK pointer by stable property id', () => {
    const customers = migrateTableOdcsFields({
      id: 'tbl-customers',
      physicalName: 'customers',
      quantumName: 'customers',
      tableType: 'table',
      description: '',
      columns: [{
        id: 'tbl_customers_id_prop',
        physicalName: 'id',
        logicalName: 'Id',
        physicalType: 'UUID',
        logicalType: 'string',
        required: true,
        isPrimaryKey: true,
        isPII: false,
        isUnique: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      }],
    } as unknown as SchemaTable)

    const orders = migrateTableOdcsFields({
      id: 'tbl-orders',
      physicalName: 'orders',
      quantumName: 'orders',
      tableType: 'table',
      description: '',
      columns: [{
        id: 'tbl_orders_customer_id_prop',
        physicalName: 'customer_id',
        logicalName: 'Customer',
        physicalType: 'UUID',
        logicalType: 'string',
        required: true,
        isPrimaryKey: false,
        isPII: false,
        isUnique: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
        foreignKey: { toTable: 'customers', toColumn: 'id' },
      }],
    } as unknown as SchemaTable)

    const pointer = propertyRelationshipPointer(
      [orders, customers],
      'customers',
      'id',
    )
    expect(pointer).toBe('/schema/tbl-customers/properties/tbl_customers_id_prop')

    const renamedOrders: SchemaTable = {
      ...orders,
      columns: orders.columns.map(c =>
        c.id === 'tbl_orders_customer_id_prop'
          ? { ...c, physicalName: 'cust_id', name: 'cust_id' }
          : c,
      ),
    }
    const fkMap = buildPropertyForeignKeys(renamedOrders, [renamedOrders, customers])
    const rels = fkMap.get('cust_id')
    expect(rels?.[0]).toMatchObject({
      type: 'foreignKey',
      to: pointer,
    })
  })
})
