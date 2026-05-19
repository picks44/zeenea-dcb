import { describe, expect, it } from 'vitest'
import {
  isValidSlaDriver,
  isValidSlaElement,
  isValidSlaUnit,
  isValidQualityDimension,
  isValidCustomPropertyName,
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
})
