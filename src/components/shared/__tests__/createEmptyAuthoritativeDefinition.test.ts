import { describe, it, expect } from 'vitest'
import { createEmptyAuthoritativeDefinition } from '@/components/shared/AuthoritativeDefinitionsEditor'
import { isAuthoritativeDefinitionEmpty } from '@/lib/odcsSharedMappers'
import { FUNDAMENTALS_AUTH_DEF_TYPES, ZEENEA_AUTH_DEF_TYPE } from '@/types/odcsShared'

describe('createEmptyAuthoritativeDefinition', () => {
  it('fundamentals row defaults to privacyStatement and is kept in editor state', () => {
    const row = createEmptyAuthoritativeDefinition('fundamentals')
    expect(row.type).toBe(FUNDAMENTALS_AUTH_DEF_TYPES[0])
    expect(row.url).toBe('')
    expect(row.description).toBe('')
    expect(isAuthoritativeDefinitionEmpty(row)).toBe(false)
  })

  it('zeenea row defaults to actian type', () => {
    const row = createEmptyAuthoritativeDefinition('zeenea')
    expect(row.type).toBe(ZEENEA_AUTH_DEF_TYPE)
    expect(isAuthoritativeDefinitionEmpty(row)).toBe(false)
  })

  it('shared row keeps empty type until user selects one', () => {
    const row = createEmptyAuthoritativeDefinition('shared')
    expect(row.type).toBe('')
    expect(isAuthoritativeDefinitionEmpty(row)).toBe(true)
  })
})
