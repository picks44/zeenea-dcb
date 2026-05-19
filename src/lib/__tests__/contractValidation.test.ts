import { describe, expect, it } from 'vitest'
import { validateContract } from '@/lib/contractValidation'
import { buildP1FixtureContract } from './p1-fixture'

describe('validateContract P1', () => {
  it('passes a complete P1 fixture', () => {
    const c = buildP1FixtureContract()
    const result = validateContract(c, [c])
    expect(result.canPublish).toBe(true)
  })

  it('requires sla property when row has other fields', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', value: '4', unit: 'h' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-property-required')).toBe(true)
  })

  it('requires sla value when property is set', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', property: 'latency', value: '', unit: 'h' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-value-required')).toBe(true)
  })

  it('rejects invalid sla property type', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', property: 'ly' as never, value: '4' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-property-invalid')).toBe(true)
  })

  it('rejects invalid sla unit when row present', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', property: 'latency', value: '4', unit: 'weeks' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-unit-invalid')).toBe(true)
  })

  it('rejects invalid sla driver when row present', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', property: 'latency', value: '4', driver: 'marketing' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-driver-invalid')).toBe(true)
  })

  it('rejects invalid sla element when row present', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', property: 'latency', value: '4', element: 'invalid' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-element-invalid')).toBe(true)
  })

  it('requires roles[].role when row has user content', () => {
    const c = buildP1FixtureContract()
    c.roles = [{ id: 'r', role: '  ', access: 'read', description: 'partial row' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'role-incomplete')).toBe(true)
  })

  it('ignores placeholder data access role rows at publish', () => {
    const c = buildP1FixtureContract()
    c.roles = [{ id: 'r', role: '', access: 'read', description: '' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code.startsWith('role-'))).toBe(false)
  })

  it('accepts role name with surrounding whitespace when trimmed', () => {
    const c = buildP1FixtureContract()
    c.roles = [{
      id: 'r',
      role: '  microstrategy_user_opr  ',
      access: 'read',
      description: '',
    }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'role-incomplete')).toBe(false)
    expect(result.canPublish).toBe(true)
  })

  it('blocks table quality without AI verification', () => {
    const c = buildP1FixtureContract()
    const table = c.dataset[0]
    table.quality = [{
      id: 'q',
      type: 'text',
      description: 'rule',
      dimension: 'accuracy',
      aiVerified: false,
    }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'quality-ai-unverified')).toBe(true)
  })

  it('rejects legacy slug-only contract id at publish', () => {
    const c = buildP1FixtureContract()
    c.id = 'seller-payments-v1'
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'id-format' || e.code === 'id-derived')).toBe(true)
    expect(result.canPublish).toBe(false)
  })

  it('rejects duplicate contract id in registry', () => {
    const c = buildP1FixtureContract()
    const other = { ...c, uid: 'other' }
    const result = validateContract(c, [c, other])
    expect(result.errors.some(e => e.code === 'id-duplicate')).toBe(true)
  })

  it('blocks publish when status is proposed', () => {
    const c = buildP1FixtureContract()
    c.info.status = 'proposed'
    const result = validateContract(c, [c])
    expect(result.canPublish).toBe(false)
    expect(result.errors.some(e => e.code === 'status-proposed')).toBe(true)
  })

  it('rejects corrupted role access outside read|write', () => {
    const c = buildP1FixtureContract()
    c.roles = [{
      id: 'r',
      role: 'analytics_user',
      access: 'admin' as 'read',
      description: '',
    }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'role-access-invalid')).toBe(true)
    expect(result.canPublish).toBe(false)
  })

  it('rejects quality rule with non-text type on table', () => {
    const c = buildP1FixtureContract()
    const table = c.dataset[0]
    table.quality = [{
      id: 'q',
      type: 'sql' as 'text',
      description: 'Must not publish',
      dimension: 'accuracy',
      aiVerified: true,
    }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'quality-type-invalid')).toBe(true)
    expect(result.canPublish).toBe(false)
  })

  it('rejects quality rule with library type on column', () => {
    const c = buildP1FixtureContract()
    const col = c.dataset[0].columns[0]
    col.quality = [{
      id: 'q2',
      type: 'library' as 'text',
      description: 'Library rule not allowed in P1',
      dimension: 'completeness',
    }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'quality-type-invalid')).toBe(true)
    expect(result.canPublish).toBe(false)
  })
})
