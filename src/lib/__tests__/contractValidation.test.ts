import { describe, expect, it } from 'vitest'
import { validateContract } from '@/lib/contractValidation'
import { buildP1FixtureContract } from './p1-fixture'

describe('validateContract P1', () => {
  it('passes a complete P1 fixture', () => {
    const c = buildP1FixtureContract()
    const result = validateContract(c, [c])
    expect(result.canPublish).toBe(true)
  })

  it('requires sla value only (not property)', () => {
    const c = buildP1FixtureContract()
    c.slaProperties = [{ id: 'x', value: '', unit: 'h' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'sla-value-required')).toBe(true)
  })

  it('requires roles[].role when row present', () => {
    const c = buildP1FixtureContract()
    c.roles = [{ id: 'r', role: '  ', access: 'read', description: 'partial row' }]
    const result = validateContract(c, [c])
    expect(result.errors.some(e => e.code === 'role-incomplete')).toBe(true)
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

  it('rejects duplicate contract id in registry', () => {
    const c = buildP1FixtureContract()
    const other = { ...c, uid: 'other' }
    const result = validateContract(c, [c, other])
    expect(result.errors.some(e => e.code === 'id-duplicate')).toBe(true)
  })
})
