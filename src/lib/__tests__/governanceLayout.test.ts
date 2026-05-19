import { describe, expect, it } from 'vitest'
import {
  GOVERNANCE_EMPTY_SECTION_WIDTH_CLASS,
  GOVERNANCE_SECTION_WIDTH_NARROW_CLASS,
  GOVERNANCE_SECTION_WIDTH_STANDARD_CLASS,
  GOVERNANCE_SECTION_WIDTH_WIDE_CLASS,
} from '@/lib/governanceLayout'

describe('governanceLayout width tokens', () => {
  it('uses 720px for standard and empty section widths', () => {
    expect(GOVERNANCE_EMPTY_SECTION_WIDTH_CLASS).toBe('max-w-[720px]')
    expect(GOVERNANCE_SECTION_WIDTH_STANDARD_CLASS).toBe('max-w-[720px]')
  })

  it('keeps narrow and wide content widths distinct from empty standard', () => {
    expect(GOVERNANCE_SECTION_WIDTH_NARROW_CLASS).toBe('max-w-[560px]')
    expect(GOVERNANCE_SECTION_WIDTH_WIDE_CLASS).toBe('max-w-[840px]')
  })
})
