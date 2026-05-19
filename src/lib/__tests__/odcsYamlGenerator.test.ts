import { describe, expect, it } from 'vitest'
import { buildOdcsDocument } from '@/lib/odcsYamlGenerator'
import { buildP1FixtureContract } from './p1-fixture'
import { NOT_PRIMARY_KEY_POSITION, ODCS_API_VERSION, ODCS_KIND } from '@/lib/p1Constants'
import { deriveContractId } from '@/lib/idDerivation'

describe('buildOdcsDocument P1 export', () => {
  const doc = buildOdcsDocument(buildP1FixtureContract())

  it('exports fundamentals (apiVersion, kind, id, version, status, name, domain, description, tags)', () => {
    expect(doc.apiVersion).toBe(ODCS_API_VERSION)
    expect(doc.kind).toBe(ODCS_KIND)
    expect(doc.id).toBe(deriveContractId('Seller Payments v1', 'p1-fixture'))
    expect(doc.version).toBe('1.1.0')
    expect(doc.status).toBe('draft')
    expect(doc.name).toBe('Seller Payments v1')
    expect(doc.domain).toBe('seller')
    expect((doc.description as Record<string, unknown>).purpose).toBeTruthy()
    expect(doc.tags).toEqual(['finance', 'sensitive'])
    expect(doc.dataProduct).toBeUndefined()
  })

  it('exports customProperties', () => {
    const cp = doc.customProperties as Record<string, unknown>[]
    expect(cp[0].property).toBe('dataSteward')
    expect(cp[0].value).toBe('john.doe@example.com')
  })

  it('exports schema object fields', () => {
    const schema = doc.schema as Record<string, unknown>[]
    const orders = schema.find(s => s.id === 'tbl-orders') as Record<string, unknown>
    expect(orders.physicalName).toBe('orders')
    expect(orders.description).toBeTruthy()
    expect(orders.tags).toEqual(['Core'])
    expect((orders.quality as unknown[]).length).toBe(1)
    expect((orders.authoritativeDefinitions as unknown[])[0]).toMatchObject({ type: 'actian' })
  })

  it('exports property fields including items, primaryKeyPosition, relationships pointer', () => {
    const schema = doc.schema as Record<string, unknown>[]
    const orders = schema.find(s => s.id === 'tbl-orders') as Record<string, unknown>
    const props = orders.properties as Record<string, unknown>[]
    const txn = props.find(p => p.id === 'tbl_orders_txn_ref_dt_prop')!
    expect(txn.primaryKeyPosition).toBe(1)
    expect(txn.physicalType).toBe('DATE')
    expect(txn.required).toBe(true)
    expect(txn.examples).toEqual(['2022-10-03'])
    const rels = txn.relationships as Record<string, unknown>[]
    expect(rels[0]).toMatchObject({
      type: 'foreignKey',
      to: '/schema/tbl-customers/properties/tbl_customers_id_prop',
    })
    const tagsCol = props.find(p => p.logicalType === 'array')!
    expect((tagsCol.items as Record<string, unknown>).logicalType).toBe('string')
    const nonPk = props.find(p => p.id === 'tbl_orders_tags_prop')!
    expect(nonPk.primaryKeyPosition).toBe(NOT_PRIMARY_KEY_POSITION)
  })

  it('exports slaProperties with property first', () => {
    const sla = doc.slaProperties as Record<string, unknown>[]
    expect(sla[0].property).toBe('latency')
    expect(sla[0].value).toBe('4')
    expect(sla[0].unit).toBe('h')
    expect(sla[0].element).toBe('orders.TXN_REF_DT')
    expect(sla[0].driver).toBe('regulatory')
    expect(Object.keys(sla[0])[0]).toBe('property')
    expect(Object.keys(sla[0])[1]).toBe('value')
  })

  it('trims sla value on export', () => {
    const contract = buildP1FixtureContract()
    contract.slaProperties = [{
      id: 'sla1',
      property: 'latency',
      value: '  4  ',
      unit: 'h',
    }]
    const sla = buildOdcsDocument(contract).slaProperties as Record<string, unknown>[]
    expect(sla).toHaveLength(1)
    expect(sla[0].value).toBe('4')
  })

  it('omits slaProperties when all rows are empty', () => {
    const contract = buildP1FixtureContract()
    contract.slaProperties = [{
      id: 'empty',
      value: '',
      unit: '',
      element: '',
      driver: '',
      description: '',
    }]
    const exported = buildOdcsDocument(contract)
    expect(exported.slaProperties).toBeUndefined()
  })

  it('omits incomplete sla rows from export (property + value required)', () => {
    const contract = buildP1FixtureContract()
    contract.slaProperties = [
      { id: 'partial', value: '4', unit: 'h' },
      {
        id: 'complete',
        property: 'retention',
        value: '30',
        unit: 'd',
      },
    ]
    const sla = buildOdcsDocument(contract).slaProperties as Record<string, unknown>[] | undefined
    expect(sla).toHaveLength(1)
    expect(sla![0].property).toBe('retention')
    expect(sla![0].value).toBe('30')
  })

  it('exports roles', () => {
    const roles = doc.roles as Record<string, unknown>[]
    expect(roles[0].role).toBe('microstrategy_user_opr')
    expect(roles[0].access).toBe('read')
  })

  it('exports quality rule shared components', () => {
    const schema = doc.schema as Record<string, unknown>[]
    const orders = schema.find(s => s.id === 'tbl-orders') as Record<string, unknown>
    const prop = (orders.properties as Record<string, unknown>[])[0]
    const q = (prop.quality as Record<string, unknown>[])[0]
    expect(q.id).toBe('order_id_no_nulls')
    expect(q.type).toBe('text')
    expect(q.dimension).toBe('completeness')
    expect(q.severity).toBe('high')
    expect(q.businessImpact).toBe('Reporting failure')
  })

  it('exports roles with write access', () => {
    const contract = buildP1FixtureContract()
    contract.roles = [{
      id: 'r-write',
      role: 'bq_unica_user_opr',
      access: 'write',
      description: 'Write access to finance tables',
    }]
    const roles = buildOdcsDocument(contract).roles as Record<string, unknown>[]
    expect(roles[0].access).toBe('write')
  })

  it('exports array items with object logicalType and nested properties', () => {
    const contract = buildP1FixtureContract()
    const tagsCol = contract.dataset[0].columns.find(c => c.logicalType === 'array')!
    tagsCol.items = {
      logicalType: 'object',
      properties: [{
        id: 'item_field_a',
        physicalName: 'field_a',
        logicalName: 'field_a',
        physicalType: 'VARCHAR',
        logicalType: 'string',
        required: false,
        isPrimaryKey: false,
        isPII: false,
        isUnique: false,
        description: '',
        examples: [],
        qualityRule: '',
        isUnknownType: false,
      }],
    }
    const schema = buildOdcsDocument(contract).schema as Record<string, unknown>[]
    const orders = schema.find(s => s.id === 'tbl-orders') as Record<string, unknown>
    const props = orders.properties as Record<string, unknown>[]
    const arrayCol = props.find(p => p.logicalType === 'array')!
    const items = arrayCol.items as Record<string, unknown>
    expect(items.logicalType).toBe('object')
    const nested = items.properties as Record<string, unknown>[]
    expect(nested).toHaveLength(1)
    expect(nested[0].physicalName).toBe('field_a')
  })

  it('exports composite primaryKeyPosition 1 and 2', () => {
    const contract = buildP1FixtureContract()
    const table = contract.dataset[0]
    table.columns.push({
      id: 'tbl_orders_region_prop',
      physicalName: 'REGION_CD',
      logicalName: 'Region Cd',
      physicalType: 'VARCHAR(2)',
      logicalType: 'string',
      required: true,
      isPrimaryKey: true,
      isPII: false,
      isUnique: false,
      description: 'Second PK column',
      examples: [],
      qualityRule: '',
      isUnknownType: false,
    })
    const schema = buildOdcsDocument(contract).schema as Record<string, unknown>[]
    const orders = schema.find(s => s.id === 'tbl-orders') as Record<string, unknown>
    const props = orders.properties as Record<string, unknown>[]
    const pk1 = props.find(p => p.id === 'tbl_orders_txn_ref_dt_prop')!
    const pk2 = props.find(p => p.id === 'tbl_orders_region_prop')!
    const nonPk = props.find(p => p.id === 'tbl_orders_tags_prop')!
    expect(pk1.primaryKeyPosition).toBe(1)
    expect(pk2.primaryKeyPosition).toBe(2)
    expect(nonPk.primaryKeyPosition).toBe(NOT_PRIMARY_KEY_POSITION)
  })

  it.each([
    'privacyStatement',
    'termsAndConditions',
    'licenseAgreement',
  ] as const)('exports fundamentals authoritativeDefinitions type %s', type => {
    const contract = buildP1FixtureContract()
    contract.info.descriptionAuthoritativeDefinitions = [{
      id: `ad-${type}`,
      url: `https://example.com/${type}`,
      type,
      description: `Ref ${type}`,
    }]
    const desc = buildOdcsDocument(contract).description as Record<string, unknown>
    const defs = desc.authoritativeDefinitions as Record<string, unknown>[]
    expect(defs[0].type).toBe(type)
  })
})
