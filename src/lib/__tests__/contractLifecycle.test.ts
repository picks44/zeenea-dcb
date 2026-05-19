import { describe, expect, it } from 'vitest'
import {
  applyLifecycleAction,
  canPublishFromStatus,
  canTransitionStatus,
  isContractEditableStatus,
  isContractLocked,
  isImportSectionEditable,
  LIFECYCLE_TRANSITIONS,
} from '@/lib/contractLifecycle'
import { LIFECYCLE_STATUSES } from '@/lib/p1Constants'

describe('contractLifecycle P1', () => {
  it('defines transitions for all five ODCS statuses', () => {
    for (const status of LIFECYCLE_STATUSES) {
      expect(LIFECYCLE_TRANSITIONS[status]).toBeDefined()
    }
  })

  it('allows proposed → draft → active → deprecated → retired', () => {
    expect(canTransitionStatus('proposed', 'draft')).toBe(true)
    expect(canTransitionStatus('draft', 'active')).toBe(true)
    expect(canTransitionStatus('active', 'deprecated')).toBe(true)
    expect(canTransitionStatus('deprecated', 'retired')).toBe(true)
  })

  it('rejects skipping lifecycle steps', () => {
    expect(canTransitionStatus('proposed', 'active')).toBe(false)
    expect(canTransitionStatus('draft', 'retired')).toBe(false)
    expect(canTransitionStatus('retired', 'draft')).toBe(false)
  })

  it('applyLifecycleAction performs system transitions', () => {
    expect(applyLifecycleAction('proposed', 'start_draft')).toBe('draft')
    expect(applyLifecycleAction('draft', 'publish')).toBe('active')
    expect(applyLifecycleAction('active', 'deprecate')).toBe('deprecated')
    expect(applyLifecycleAction('deprecated', 'retire')).toBe('retired')
  })

  it('canPublishFromStatus allows draft and active in revision only', () => {
    expect(canPublishFromStatus('draft')).toBe(true)
    expect(canPublishFromStatus('proposed')).toBe(false)
    expect(canPublishFromStatus('active', true)).toBe(true)
    expect(canPublishFromStatus('active', false)).toBe(false)
    expect(canPublishFromStatus('deprecated')).toBe(false)
    expect(canPublishFromStatus('retired')).toBe(false)
  })

  it('isContractEditableStatus locks proposed like published active', () => {
    expect(isContractEditableStatus('proposed')).toBe(false)
    expect(isContractEditableStatus('draft')).toBe(true)
    expect(isContractEditableStatus('active', false)).toBe(false)
    expect(isContractEditableStatus('active', true)).toBe(true)
    expect(isContractEditableStatus('deprecated')).toBe(false)
    expect(isContractEditableStatus('retired')).toBe(false)
  })

  it('isContractLocked mirrors lifecycle and viewer rules', () => {
    expect(isContractLocked('proposed', false, false)).toBe(true)
    expect(isContractLocked('draft', false, false)).toBe(false)
    expect(isContractLocked('draft', false, true)).toBe(true)
    expect(isContractLocked('active', false, false)).toBe(true)
    expect(isContractLocked('active', true, false)).toBe(false)
  })

  it('isImportSectionEditable allows import only in proposed for non-viewers', () => {
    expect(isImportSectionEditable('proposed', false)).toBe(true)
    expect(isImportSectionEditable('proposed', true)).toBe(false)
    expect(isImportSectionEditable('draft', false)).toBe(false)
    expect(isImportSectionEditable('active', false)).toBe(false)
  })
})
