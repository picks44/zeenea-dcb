import { describe, expect, it } from 'vitest'
import { validateContract } from '@/lib/contractValidation'
import { buildP1FixtureContract } from '@/lib/__tests__/p1-fixture'
import {
  publishBlockUserMessage,
  validationUserMessage,
} from '@/lib/validationUserMessages'
import type { ValidationIssue } from '@/lib/contractValidation'

function issue(code: string, message: string, severity: 'error' | 'warning' = 'error'): ValidationIssue {
  return { code, message, severity }
}

describe('validationUserMessage', () => {
  it('maps C1 status-invalid', () => {
    expect(
      validationUserMessage(
        issue('status-invalid', 'Contract status must be a valid ODCS lifecycle value.'),
      ),
    ).toBe('Contract status is invalid. Try starting a draft or creating a new version.')
  })

  it('maps auth-def-fundamentals-type without ODCS enum names', () => {
    const msg = validationUserMessage(
      issue(
        'auth-def-fundamentals-type',
        'Contract description reference type must be privacyStatement, termsAndConditions, or licenseAgreement.',
      ),
    )
    expect(msg).toContain('Privacy statement')
    expect(msg).not.toContain('privacyStatement')
  })

  it('maps relationship-not-exported without ODCS YAML', () => {
    const msg = validationUserMessage(
      issue(
        'relationship-not-exported',
        'Relationship "has_many" on "orders" uses a legacy type (not published to ODCS YAML).',
        'warning',
      ),
    )
    expect(msg).toContain('exported contract')
    expect(msg).not.toMatch(/ODCS|YAML|legacy/i)
  })

  it('maps quality-ai-unverified', () => {
    expect(
      validationUserMessage(
        issue(
          'quality-ai-unverified',
          'Quality rule on table "orders" must be verified by AI before publishing.',
        ),
      ),
    ).toBe('Review and confirm table quality rules before publishing.')
  })

  it('falls back to technical message for unmapped codes', () => {
    const technical = 'Contract name is required.'
    expect(validationUserMessage(issue('title', technical))).toBe(technical)
  })
})

describe('publishBlockUserMessage', () => {
  it('uses user message for first validation error', () => {
    const contract = buildP1FixtureContract()
    contract.info.title = ''
    const validation = validateContract(contract)
    expect(validation.canPublish).toBe(false)
    expect(publishBlockUserMessage(validation)).toBe('Contract name is required.')
  })

  it('maps lifecycle-only publish block', () => {
    const contract = buildP1FixtureContract()
    contract.info.status = 'active'
    contract.inRevision = false
    const validation = validateContract(contract)
    expect(validation.errors).toHaveLength(0)
    expect(publishBlockUserMessage(validation)).toBe(
      'Start a new version to edit, or finish drafting before you publish.',
    )
  })

  it('returns null when publish is allowed', () => {
    const contract = buildP1FixtureContract()
    contract.info.status = 'draft'
    const validation = validateContract(contract)
    expect(validation.canPublish).toBe(true)
    expect(publishBlockUserMessage(validation)).toBeNull()
  })
})
