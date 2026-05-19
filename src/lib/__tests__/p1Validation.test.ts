import { describe, expect, it } from 'vitest'
import {
  FUNDAMENTALS_AUTH_DEF_TYPES,
  QUALITY_DIMENSIONS,
  SLA_UNITS,
} from '@/lib/p1Constants'
import {
  isValidFundamentalsAuthDefType,
  isValidQualityDimension,
  isValidQualityRuleType,
  isValidRoleAccess,
  isValidSlaDriver,
  isValidSlaElement,
  isValidSlaUnit,
  isValidCustomPropertyName,
  isValidZeeneaAuthDef,
} from '@/lib/p1Validation'

describe('p1Validation enums', () => {
  it.each(SLA_UNITS)('accepts SLA unit "%s" from p1', unit => {
    expect(isValidSlaUnit(unit)).toBe(true)
  })

  it('rejects unknown SLA units', () => {
    expect(isValidSlaUnit('weeks')).toBe(false)
    expect(isValidSlaUnit('')).toBe(false)
  })

  it.each(QUALITY_DIMENSIONS)('accepts quality dimension "%s" from p1', dimension => {
    expect(isValidQualityDimension(dimension)).toBe(true)
  })

  it('rejects unknown quality dimensions', () => {
    expect(isValidQualityDimension('invalid')).toBe(false)
  })

  it.each(FUNDAMENTALS_AUTH_DEF_TYPES)('accepts fundamentals auth def type "%s"', type => {
    expect(isValidFundamentalsAuthDefType(type)).toBe(true)
  })

  it('rejects unknown fundamentals auth def types', () => {
    expect(isValidFundamentalsAuthDefType('businessDefinition')).toBe(false)
    expect(isValidFundamentalsAuthDefType('actian')).toBe(false)
  })

  it('accepts role access read and write', () => {
    expect(isValidRoleAccess('read')).toBe(true)
    expect(isValidRoleAccess('write')).toBe(true)
  })

  it('rejects invalid role access values', () => {
    expect(isValidRoleAccess('admin')).toBe(false)
    expect(isValidRoleAccess('')).toBe(false)
  })

  it('accepts only text quality rule type for P1', () => {
    expect(isValidQualityRuleType('text')).toBe(true)
  })

  it('rejects non-text quality rule types', () => {
    expect(isValidQualityRuleType('library')).toBe(false)
    expect(isValidQualityRuleType('sql')).toBe(false)
    expect(isValidQualityRuleType('custom')).toBe(false)
    expect(isValidQualityRuleType(undefined)).toBe(false)
  })

  it('accepts SLA drivers from p1', () => {
    expect(isValidSlaDriver('regulatory')).toBe(true)
    expect(isValidSlaDriver('operational')).toBe(true)
  })

  it('validates element Object.Property with commas', () => {
    expect(isValidSlaElement('orders.TXN_REF_DT')).toBe(true)
    expect(isValidSlaElement('orders.id, customers.id')).toBe(true)
    expect(isValidSlaElement('invalid')).toBe(false)
  })

  it('validates camelCase custom properties', () => {
    expect(isValidCustomPropertyName('dataSteward')).toBe(true)
    expect(isValidCustomPropertyName('DataSteward')).toBe(false)
  })

  it('accepts Zeenea auth defs only from catalog or strict Actian URL pattern', () => {
    expect(isValidZeeneaAuthDef({
      id: '1',
      url: 'https://catalog.zeenea.example/actian/glossary/order',
      type: 'actian',
    })).toBe(true)
    expect(isValidZeeneaAuthDef({
      id: '2',
      url: 'https://random.example/zeenea/item',
      type: 'actian',
    })).toBe(false)
    expect(isValidZeeneaAuthDef({
      id: '3',
      url: 'https://catalog.zeenea.example/actian/custom/path',
      type: 'actian',
    })).toBe(true)
  })
})
