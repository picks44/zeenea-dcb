import { describe, expect, it } from 'vitest'
import type { ValidationIssue } from '@/lib/contractValidation'
import { getSupplementalValidationErrors } from '@/lib/publicationReadiness'

function issue(code: string, message: string): ValidationIssue {
  return {
    code,
    message,
    severity: 'error',
    section: 'fundamentals',
  }
}

describe('getSupplementalValidationErrors', () => {
  it('returns empty when there are no errors', () => {
    expect(getSupplementalValidationErrors([])).toEqual([])
  })

  it('returns empty when there is only one error (shown in header)', () => {
    const errors = [issue('owner', 'Business owner required before publishing.')]
    expect(getSupplementalValidationErrors(errors)).toEqual([])
  })

  it('returns all errors after the first when multiple exist', () => {
    const errors = [
      issue('title', 'Contract name is required.'),
      issue('owner', 'Business owner required before publishing.'),
      issue('version', 'Version must follow SemVer (e.g. 1.0.0).'),
    ]
    expect(getSupplementalValidationErrors(errors)).toEqual(errors.slice(1))
  })
})
