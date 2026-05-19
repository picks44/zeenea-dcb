import { describe, it, expect } from 'vitest'
import {
  applyStartFromScratch,
  createContract,
  getInitialLifecycleStatus,
  shouldHideStartDraftingInTopBar,
} from '@/lib/createContract'

describe('getInitialLifecycleStatus', () => {
  it('returns draft for manual creation', () => {
    expect(getInitialLifecycleStatus('manual')).toBe('draft')
  })

  it('returns proposed for import creation', () => {
    expect(getInitialLifecycleStatus('import')).toBe('proposed')
  })
})

describe('createContract', () => {
  it('creates a manual contract in draft with creationSource manual', () => {
    const c = createContract('manual')
    expect(c.info.status).toBe('draft')
    expect(c.creationSource).toBe('manual')
    expect(c.dataset).toEqual([])
    expect(c.uid).toBeTruthy()
  })

  it('creates an import contract in proposed with creationSource import', () => {
    const c = createContract('import')
    expect(c.info.status).toBe('proposed')
    expect(c.creationSource).toBe('import')
    expect(c.dataset).toEqual([])
  })
})

describe('shouldHideStartDraftingInTopBar', () => {
  it('hides on initial Import step for import-sourced proposed contracts', () => {
    expect(shouldHideStartDraftingInTopBar('proposed', 'import', 'import')).toBe(true)
  })

  it('shows after SQL import when user leaves Import section', () => {
    expect(shouldHideStartDraftingInTopBar('proposed', 'import', 'fundamentals')).toBe(false)
  })

  it('shows for legacy proposed without creationSource on Import', () => {
    expect(shouldHideStartDraftingInTopBar('proposed', undefined, 'import')).toBe(false)
  })

  it('does not apply outside proposed', () => {
    expect(shouldHideStartDraftingInTopBar('draft', 'import', 'import')).toBe(false)
  })
})

describe('applyStartFromScratch', () => {
  it('transitions proposed import contract to draft manual', () => {
    const c = createContract('import')
    const next = applyStartFromScratch(c)
    expect(next.info.status).toBe('draft')
    expect(next.creationSource).toBe('manual')
  })

  it('leaves non-proposed status unchanged', () => {
    const c = createContract('manual')
    const next = applyStartFromScratch(c)
    expect(next.info.status).toBe('draft')
    expect(next.creationSource).toBe('manual')
  })
})
