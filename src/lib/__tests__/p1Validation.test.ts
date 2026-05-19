import { describe, expect, it } from 'vitest'
import {
  isValidSlaDriver,
  isValidSlaElement,
  isValidSlaUnit,
  isValidQualityDimension,
  isValidCustomPropertyName,
  isValidZeeneaAuthDef,
} from '@/lib/p1Validation'

describe('p1Validation enums', () => {
  it('accepts SLA units from p1', () => {
    expect(isValidSlaUnit('d')).toBe(true)
    expect(isValidSlaUnit('hours')).toBe(true)
    expect(isValidSlaUnit('weeks')).toBe(false)
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

  it('validates quality dimensions', () => {
    expect(isValidQualityDimension('timeliness')).toBe(true)
    expect(isValidQualityDimension('invalid')).toBe(false)
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
