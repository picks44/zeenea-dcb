import { describe, expect, it } from 'vitest'
import {
  FUNDAMENTALS_AUTH_DEF_TYPES,
  QUALITY_DIMENSIONS,
  ROLE_ACCESS_VALUES,
  SLA_DRIVERS,
  SLA_PROPERTY_TYPES,
  SLA_UNITS,
} from '@/lib/p1Constants'
import {
  isValidFundamentalsAuthDefType,
  isRoleRowExportable,
  isSlaRowExportable,
  isValidQualityDimension,
  isValidQualityRuleType,
  isValidRoleAccess,
  isValidSlaDriver,
  isValidSlaElement,
  isValidSlaPropertyType,
  isValidSlaUnit,
  isValidCustomPropertyName,
  isValidZeeneaAuthDef,
  roleRowHasContent,
  slaRowHasContent,
} from '@/lib/p1Validation'

describe('p1Validation enums', () => {
  it.each(SLA_UNITS)('accepts SLA unit "%s" from p1', unit => {
    expect(isValidSlaUnit(unit)).toBe(true)
  })

  it('rejects unknown SLA units', () => {
    expect(isValidSlaUnit('weeks')).toBe(false)
    expect(isValidSlaUnit('')).toBe(false)
  })

  it.each(SLA_PROPERTY_TYPES)('accepts SLA property type "%s" from ODCS', property => {
    expect(isValidSlaPropertyType(property)).toBe(true)
  })

  it('rejects unknown SLA property types', () => {
    expect(isValidSlaPropertyType('')).toBe(false)
    expect(isValidSlaPropertyType('ly')).toBe(false)
    expect(isValidSlaPropertyType('latencyX')).toBe(false)
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

  it.each(ROLE_ACCESS_VALUES)('accepts role access "%s" from p1', access => {
    expect(isValidRoleAccess(access)).toBe(true)
  })

  it('rejects invalid role access values', () => {
    expect(isValidRoleAccess('admin')).toBe(false)
    expect(isValidRoleAccess('')).toBe(false)
  })

  it('roleRowHasContent and isRoleRowExportable align with SLA row helpers', () => {
    const placeholder = { id: '1', role: '', access: 'read' as const, description: '' }
    expect(roleRowHasContent(placeholder)).toBe(false)
    expect(isRoleRowExportable(placeholder)).toBe(false)

    const descriptionOnly = { id: '2', role: '', access: 'read' as const, description: 'note' }
    expect(roleRowHasContent(descriptionOnly)).toBe(true)
    expect(isRoleRowExportable(descriptionOnly)).toBe(false)

    const writeOnly = { id: '3', role: '', access: 'write' as const, description: '' }
    expect(roleRowHasContent(writeOnly)).toBe(true)
    expect(isRoleRowExportable(writeOnly)).toBe(false)

    const exportable = { id: '4', role: '  microstrategy_user_opr  ', access: 'read' as const }
    expect(roleRowHasContent(exportable)).toBe(true)
    expect(isRoleRowExportable(exportable)).toBe(true)
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

  it.each(SLA_DRIVERS)('accepts SLA driver "%s" from p1', driver => {
    expect(isValidSlaDriver(driver)).toBe(true)
  })

  it('isSlaRowExportable requires property and trimmed value', () => {
    expect(isSlaRowExportable({ id: '1', value: '', property: 'latency' })).toBe(false)
    expect(isSlaRowExportable({ id: '1', value: '4', property: undefined })).toBe(false)
    expect(isSlaRowExportable({ id: '1', value: '  4  ', property: 'latency' })).toBe(true)
    expect(slaRowHasContent({ id: '1', value: '4', unit: 'h' })).toBe(true)
    expect(isSlaRowExportable({ id: '1', value: '4', unit: 'h' })).toBe(false)
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
