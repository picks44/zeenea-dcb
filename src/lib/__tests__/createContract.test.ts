import { describe, it, expect } from 'vitest'
import {
  applyStartFromScratch,
  createContract,
  createContractWithImportedSchema,
  getInitialLifecycleStatus,
  getProposedLifecycleBannerMessage,
  shouldHideStartDraftingInTopBar,
} from '@/lib/createContract'
import {
  PROPOSED_BANNER_IMPORTED,
  PROPOSED_BANNER_IMPORT_PENDING,
  PROPOSED_BANNER_LEGACY,
} from '@/lib/uxCopy'
import type { SchemaTable } from '@/types/odcs'

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

const sampleTables: SchemaTable[] = [{
  id: 't1',
  physicalName: 'orders',
  quantumName: 'Orders',
  tableType: 'table',
  description: '',
  columns: [{
    id: 'c1',
    physicalName: 'id',
    logicalName: 'Id',
    physicalType: 'BIGINT',
    logicalType: 'integer',
    required: true,
    isPrimaryKey: true,
    isPII: false,
    isUnique: false,
    description: '',
    examples: [],
    qualityRule: '',
    isUnknownType: false,
  }],
}]

describe('getProposedLifecycleBannerMessage', () => {
  it('returns import pending when proposed import with empty dataset', () => {
    const c = createContract('import')
    expect(getProposedLifecycleBannerMessage(c)).toBe(PROPOSED_BANNER_IMPORT_PENDING)
  })

  it('returns imported review when proposed import with dataset', () => {
    const c = createContractWithImportedSchema(sampleTables)
    expect(getProposedLifecycleBannerMessage(c)).toBe(PROPOSED_BANNER_IMPORTED)
  })

  it('returns legacy message when creationSource is undefined', () => {
    const c = createContract('import')
    const legacy = { ...c, creationSource: undefined }
    expect(getProposedLifecycleBannerMessage(legacy)).toBe(PROPOSED_BANNER_LEGACY)
  })
})

describe('createContractWithImportedSchema', () => {
  it('creates proposed import contract with dataset and derived id', () => {
    const c = createContractWithImportedSchema(sampleTables)
    expect(c.info.status).toBe('proposed')
    expect(c.creationSource).toBe('import')
    expect(c.dataset).toHaveLength(1)
    expect(c.info.title).toBe('Orders')
    expect(c.id).toContain('orders')
  })

  it('throws when tables array is empty', () => {
    expect(() => createContractWithImportedSchema([])).toThrow()
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
