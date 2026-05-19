import { describe, expect, it } from 'vitest'
import {
  GOVERNANCE_COMPACT_READONLY_THRESHOLD,
  shouldUseCompactReadOnly,
} from '@/lib/governanceReadOnlyLayout'

describe('shouldUseCompactReadOnly', () => {
  it('returns false when unlocked', () => {
    expect(shouldUseCompactReadOnly(false, 1)).toBe(false)
    expect(shouldUseCompactReadOnly(false, 2)).toBe(false)
  })

  it('returns false when row count is zero', () => {
    expect(shouldUseCompactReadOnly(true, 0)).toBe(false)
  })

  it('returns true when locked and within default threshold', () => {
    expect(shouldUseCompactReadOnly(true, 1)).toBe(true)
    expect(shouldUseCompactReadOnly(true, GOVERNANCE_COMPACT_READONLY_THRESHOLD)).toBe(true)
  })

  it('returns false when locked and above threshold', () => {
    expect(shouldUseCompactReadOnly(true, GOVERNANCE_COMPACT_READONLY_THRESHOLD + 1)).toBe(false)
  })

  it('respects custom threshold', () => {
    expect(shouldUseCompactReadOnly(true, 3, 3)).toBe(true)
    expect(shouldUseCompactReadOnly(true, 4, 3)).toBe(false)
  })
})
