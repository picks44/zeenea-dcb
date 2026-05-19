/**
 * Exhaustive P1 compliance — one assertion per line in p1.md (54 rows).
 * Fails if a major P1 field disappears from model, YAML export, or validation.
 */
import { describe, expect, it } from 'vitest'
import { buildOdcsDocument } from '@/lib/odcsYamlGenerator'
import { validateContract } from '@/lib/contractValidation'
import { buildP1FixtureContract } from './p1-fixture'
import {
  FUNDAMENTALS_AUTH_DEF_TYPES,
  ODCS_API_VERSION,
  ODCS_KIND,
  NOT_PRIMARY_KEY_POSITION,
  QUALITY_DIMENSIONS,
  SHARED_AUTH_DEF_TYPES,
  SLA_DRIVERS,
  SLA_UNITS,
  ZEENEA_AUTH_DEF_TYPE,
} from '@/lib/p1Constants'
import {
  isValidFundamentalsAuthDefType,
  isValidZeeneaAuthDef,
  isValidQualityDimension,
  isValidSlaDriver,
  isValidSlaUnit,
  isValidCustomPropertyName,
  isValidLifecycleStatus,
} from '@/lib/p1Validation'
import { applyLifecycleAction, canTransitionStatus } from '@/lib/contractLifecycle'

type P1Row = {
  line: number
  tab: string
  section: string
  path: string
  run: () => void
}

function schemaTable(doc: Record<string, unknown>, id: string) {
  const schema = doc.schema as Record<string, unknown>[]
  return schema.find(s => s.id === id) as Record<string, unknown>
}

function schemaProperty(table: Record<string, unknown>, propId: string) {
  const props = table.properties as Record<string, unknown>[]
  return props.find(p => p.id === propId) as Record<string, unknown>
}

describe('P1 compliance — 54 lines (p1.md)', () => {
  const contract = buildP1FixtureContract()
  const doc = buildOdcsDocument(contract) as Record<string, unknown>
  const validation = validateContract(contract, [contract])
  const orders = schemaTable(doc, 'tbl-orders')
  const txn = schemaProperty(orders, 'tbl_orders_txn_ref_dt_prop')
  const tagsCol = schemaProperty(orders, 'tbl_orders_tags_prop')
  const desc = doc.description as Record<string, unknown>
  const fundAuth = (desc.authoritativeDefinitions as Record<string, unknown>[])[0]
  const tableQuality = (orders.quality as Record<string, unknown>[])[0]
  const propQuality = (txn.quality as Record<string, unknown>[])[0]
  const tableAuth = (orders.authoritativeDefinitions as Record<string, unknown>[])[0]
  const propAuth = (txn.authoritativeDefinitions as Record<string, unknown>[])[0]
  const sla = (doc.slaProperties as Record<string, unknown>[])[0]
  const role = (doc.roles as Record<string, unknown>[])[0]
  const custom = (doc.customProperties as Record<string, unknown>[])[0]

  const rows: P1Row[] = [
    // Schema Reference — Fundamentals (lines 1–13)
    { line: 1, tab: 'Schema Reference', section: 'Fundamentals', path: 'apiVersion', run: () => expect(doc.apiVersion).toBe(ODCS_API_VERSION) },
    { line: 2, tab: 'Schema Reference', section: 'Fundamentals', path: 'kind', run: () => expect(doc.kind).toBe(ODCS_KIND) },
    { line: 3, tab: 'Schema Reference', section: 'Fundamentals', path: 'id', run: () => expect(doc.id).toBe('seller-payments-v1') },
    { line: 4, tab: 'Schema Reference', section: 'Fundamentals', path: 'version', run: () => expect(doc.version).toBe('1.1.0') },
    {
      line: 5,
      tab: 'Schema Reference',
      section: 'Fundamentals',
      path: 'status',
      run: () => {
        expect(doc.status).toBe('draft')
        expect(isValidLifecycleStatus('proposed')).toBe(true)
        expect(canTransitionStatus('proposed', 'draft')).toBe(true)
        expect(applyLifecycleAction('proposed', 'start_draft')).toBe('draft')
      },
    },
    { line: 6, tab: 'Schema Reference', section: 'Fundamentals', path: 'name', run: () => expect(doc.name).toBe('Seller Payments v1') },
    { line: 7, tab: 'Schema Reference', section: 'Fundamentals', path: 'domain', run: () => expect(doc.domain).toBe('seller') },
    { line: 8, tab: 'Schema Reference', section: 'Fundamentals', path: 'description', run: () => expect(desc).toBeTruthy() },
    { line: 9, tab: 'Schema Reference', section: 'Fundamentals', path: 'description.purpose', run: () => expect(desc.purpose).toBeTruthy() },
    { line: 10, tab: 'Schema Reference', section: 'Fundamentals', path: 'description.limitations', run: () => expect(desc.limitations).toBeTruthy() },
    { line: 11, tab: 'Schema Reference', section: 'Fundamentals', path: 'description.usage', run: () => expect(desc.usage).toBeTruthy() },
    {
      line: 12,
      tab: 'Schema Reference',
      section: 'Fundamentals',
      path: 'description.authoritativeDefinitions',
      run: () => {
        expect(fundAuth.type).toBe('privacyStatement')
        expect(FUNDAMENTALS_AUTH_DEF_TYPES).toContain(fundAuth.type)
        expect(isValidFundamentalsAuthDefType(String(fundAuth.type))).toBe(true)
      },
    },
    { line: 13, tab: 'Schema Reference', section: 'Fundamentals', path: 'tags', run: () => expect(doc.tags).toEqual(['finance', 'sensitive']) },

    // Schema Reference — Schema (lines 14–31)
    { line: 14, tab: 'Schema Reference', section: 'Schema', path: 'schema[].id', run: () => expect(orders.id).toBe('tbl-orders') },
    { line: 15, tab: 'Schema Reference', section: 'Schema', path: 'schema[].physicalName', run: () => expect(orders.physicalName).toBe('orders') },
    { line: 16, tab: 'Schema Reference', section: 'Schema', path: 'schema[].description', run: () => expect(orders.description).toBeTruthy() },
    {
      line: 17,
      tab: 'Schema Reference',
      section: 'Schema',
      path: 'schema[].quality',
      run: () => {
        expect(tableQuality.type).toBe('text')
        expect(tableQuality.dimension).toBe('coverage')
      },
    },
    { line: 18, tab: 'Schema Reference', section: 'Schema', path: 'schema[].tags', run: () => expect(orders.tags).toEqual(['Core']) },
    {
      line: 19,
      tab: 'Schema Reference',
      section: 'Schema',
      path: 'schema[].authoritativeDefinitions',
      run: () => {
        expect(tableAuth.type).toBe(ZEENEA_AUTH_DEF_TYPE)
        expect(isValidZeeneaAuthDef({ id: 'x', url: String(tableAuth.url), type: 'actian' })).toBe(true)
      },
    },
    { line: 20, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].id', run: () => expect(txn.id).toBe('tbl_orders_txn_ref_dt_prop') },
    { line: 21, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].description', run: () => expect(txn.description).toBeTruthy() },
    { line: 22, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].physicalType', run: () => expect(txn.physicalType).toBe('DATE') },
    { line: 23, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].required', run: () => expect(txn.required).toBe(true) },
    {
      line: 24,
      tab: 'Schema Reference',
      section: 'Schema property',
      path: 'schema[].properties[].primaryKeyPosition',
      run: () => {
        expect(txn.primaryKeyPosition).toBe(1)
        expect(tagsCol.primaryKeyPosition).toBe(NOT_PRIMARY_KEY_POSITION)
      },
    },
    {
      line: 25,
      tab: 'Schema Reference',
      section: 'Schema property',
      path: 'schema[].properties[].quality',
      run: () => {
        expect(propQuality.type).toBe('text')
        expect(propQuality.dimension).toBe('completeness')
      },
    },
    { line: 26, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].physicalName', run: () => expect(txn.physicalName).toBe('TXN_REF_DT') },
    { line: 27, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].examples', run: () => expect(txn.examples).toEqual(['2022-10-03']) },
    { line: 28, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].items', run: () => expect((tagsCol.items as Record<string, unknown>).logicalType).toBe('string') },
    {
      line: 29,
      tab: 'Schema Reference',
      section: 'Schema property',
      path: 'schema[].properties[].relationships',
      run: () => {
        const rels = txn.relationships as Record<string, unknown>[]
        expect(rels[0]).toMatchObject({
          type: 'foreignKey',
          to: '/schema/tbl-customers/properties/tbl_customers_id_prop',
        })
      },
    },
    { line: 30, tab: 'Schema Reference', section: 'Schema property', path: 'schema[].properties[].tags', run: () => expect(txn.tags).toEqual(['pii']) },
    {
      line: 31,
      tab: 'Schema Reference',
      section: 'Schema property',
      path: 'schema[].properties[].authoritativeDefinitions',
      run: () => {
        expect(propAuth.type).toBe(ZEENEA_AUTH_DEF_TYPE)
        expect(isValidZeeneaAuthDef({ id: 'x', url: String(propAuth.url), type: 'actian' })).toBe(true)
      },
    },

    // SLA (lines 32–36)
    { line: 32, tab: 'Schema Reference', section: 'SLA', path: 'slaProperties[].value', run: () => expect(sla.value).toBe('4') },
    { line: 33, tab: 'Schema Reference', section: 'SLA', path: 'slaProperties[].unit', run: () => { expect(sla.unit).toBe('h'); expect(isValidSlaUnit('h')).toBe(true) } },
    { line: 34, tab: 'Schema Reference', section: 'SLA', path: 'slaProperties[].element', run: () => expect(sla.element).toBe('orders.TXN_REF_DT') },
    { line: 35, tab: 'Schema Reference', section: 'SLA', path: 'slaProperties[].driver', run: () => { expect(sla.driver).toBe('regulatory'); expect(SLA_DRIVERS).toContain('regulatory') } },
    { line: 36, tab: 'Schema Reference', section: 'SLA', path: 'slaProperties[].description', run: () => expect(sla.description).toBeTruthy() },

    // Roles (lines 37–40)
    { line: 37, tab: 'Schema Reference', section: 'Roles', path: 'roles', run: () => expect(doc.roles).toHaveLength(1) },
    { line: 38, tab: 'Schema Reference', section: 'Roles', path: 'roles[].role', run: () => expect(role.role).toBe('microstrategy_user_opr') },
    { line: 39, tab: 'Schema Reference', section: 'Roles', path: 'roles[].access', run: () => expect(role.access).toBe('read') },
    { line: 40, tab: 'Schema Reference', section: 'Roles', path: 'roles[].description', run: () => expect(role.description).toBeTruthy() },

    // Shared Components (lines 61–74)
    { line: 61, tab: 'Shared Components', section: 'Quality rule', path: '[].id', run: () => expect(propQuality.id).toBe('order_id_no_nulls') },
    { line: 62, tab: 'Shared Components', section: 'Quality rule', path: '[].name', run: () => expect(propQuality.name).toBe('No nulls') },
    { line: 63, tab: 'Shared Components', section: 'Quality rule', path: '[].description', run: () => expect(propQuality.description).toBeTruthy() },
    { line: 64, tab: 'Shared Components', section: 'Quality rule', path: '[].type', run: () => expect(propQuality.type).toBe('text') },
    {
      line: 65,
      tab: 'Shared Components',
      section: 'Quality rule',
      path: '[].dimension',
      run: () => {
        expect(propQuality.dimension).toBe('completeness')
        expect(QUALITY_DIMENSIONS).toContain('completeness')
        expect(isValidQualityDimension('completeness')).toBe(true)
      },
    },
    { line: 66, tab: 'Shared Components', section: 'Quality rule', path: '[].severity', run: () => expect(propQuality.severity).toBe('high') },
    { line: 67, tab: 'Shared Components', section: 'Quality rule', path: '[].businessImpact', run: () => expect(propQuality.businessImpact).toBeTruthy() },
    { line: 68, tab: 'Shared Components', section: 'Authoritative definition', path: '[].url', run: () => expect(fundAuth.url).toBeTruthy() },
    {
      line: 69,
      tab: 'Shared Components',
      section: 'Authoritative definition',
      path: '[].type',
      run: () => {
        expect(SHARED_AUTH_DEF_TYPES.length).toBeGreaterThan(0)
        expect(ZEENEA_AUTH_DEF_TYPE).toBe('actian')
      },
    },
    { line: 70, tab: 'Shared Components', section: 'Authoritative definition', path: '[].description', run: () => expect(fundAuth.description).toBeTruthy() },
    { line: 71, tab: 'Shared Components', section: 'Custom property', path: '[].property', run: () => { expect(custom.property).toBe('dataSteward'); expect(isValidCustomPropertyName('dataSteward')).toBe(true) } },
    { line: 72, tab: 'Shared Components', section: 'Custom property', path: '[].value', run: () => expect(custom.value).toBeTruthy() },
    { line: 73, tab: 'Shared Components', section: 'Custom property', path: '[].description', run: () => expect(custom.description).toBeTruthy() },
    { line: 74, tab: 'Shared Components', section: 'Tag', path: '[]', run: () => expect(doc.tags).toContain('finance') },
  ]

  it('defines exactly 54 P1 rows', () => {
    expect(rows).toHaveLength(54)
  })

  rows.forEach(({ line, tab, section, path, run }) => {
    it(`line ${line} [${tab}] ${section} → ${path}`, run)
  })

  it('golden export: all P1 root keys present and dataProduct absent', () => {
    const goldenKeys = [
      'apiVersion',
      'kind',
      'id',
      'version',
      'status',
      'name',
      'domain',
      'description',
      'tags',
      'schema',
      'slaProperties',
      'roles',
      'customProperties',
    ]
    for (const key of goldenKeys) {
      expect(doc).toHaveProperty(key)
    }
    expect(doc.dataProduct).toBeUndefined()
    expect(SLA_UNITS.length).toBeGreaterThan(0)
    expect(isValidSlaDriver('operational')).toBe(true)
  })

  it('validation passes on complete P1 fixture', () => {
    expect(validation.canPublish).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('rejects permissive Zeenea URLs (catalog or strict pattern only)', () => {
    expect(isValidZeeneaAuthDef({
      id: 'bad',
      url: 'https://evil.example/zeenea/fake',
      type: 'actian',
    })).toBe(false)
    expect(isValidZeeneaAuthDef({
      id: 'ok',
      url: 'https://catalog.zeenea.example/actian/glossary/order',
      type: 'actian',
    })).toBe(true)
  })

  it('detects duplicate contract id in registry via validateContract', () => {
    const other = { ...contract, uid: 'dup' }
    const dup = validateContract(contract, [contract, other])
    expect(dup.errors.some(e => e.code === 'id-duplicate')).toBe(true)
  })

  it('blocks publish while status is proposed', () => {
    const proposed = buildP1FixtureContract()
    proposed.info.status = 'proposed'
    const result = validateContract(proposed, [proposed])
    expect(result.canPublish).toBe(false)
    expect(result.errors.some(e => e.code === 'status-proposed')).toBe(true)
  })
})
