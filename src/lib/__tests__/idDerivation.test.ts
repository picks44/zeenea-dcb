import { describe, expect, it } from 'vitest'
import {
  contractIdSuffix,
  deriveContractId,
  isHybridContractId,
  isLegacySlugOnlyContractId,
  isValidContractId,
  stablePropertyId,
  stableSchemaId,
} from '@/lib/idDerivation'

const SEED_A = 'seed-contract-a'
const SEED_B = 'seed-contract-b'

describe('idDerivation P1', () => {
  it('derives hybrid contract id with slug and 8-char hex suffix', () => {
    const id = deriveContractId('Seller Payments v1', SEED_A)
    expect(id).toMatch(/^seller-payments-v1-[a-f0-9]{8}$/)
    expect(isValidContractId(id)).toBe(true)
    expect(isHybridContractId(id)).toBe(true)
  })

  it('is deterministic for the same name and contract seed', () => {
    expect(deriveContractId('Seller Payments v1', SEED_A))
      .toBe(deriveContractId('Seller Payments v1', SEED_A))
  })

  it('produces different ids for different names with the same seed', () => {
    const a = deriveContractId('Seller Payments v1', SEED_A)
    const b = deriveContractId('Customer Orders', SEED_A)
    expect(a).not.toBe(b)
    expect(a.split('-').slice(0, -1).join('-')).not.toBe(b.split('-').slice(0, -1).join('-'))
  })

  it('produces different ids for the same name with different contract seeds', () => {
    const a = deriveContractId('Seller Payments v1', SEED_A)
    const b = deriveContractId('Seller Payments v1', SEED_B)
    expect(a).not.toBe(b)
    expect(a.startsWith('seller-payments-v1-')).toBe(true)
    expect(b.startsWith('seller-payments-v1-')).toBe(true)
  })

  it('lowercases and removes accents from the name slug', () => {
    const id = deriveContractId('Café Müller v1', SEED_A)
    expect(id).toMatch(/^cafe-muller-v1-[a-f0-9]{8}$/)
    expect(id).toBe(id.toLowerCase())
  })

  it('removes special characters from the name slug', () => {
    const id = deriveContractId('Seller @ Payments!!!', SEED_A)
    expect(id).toMatch(/^seller-payments-[a-f0-9]{8}$/)
  })

  it('uses name-only suffix when no contract seed is provided', () => {
    const id = deriveContractId('Seller Payments v1')
    expect(id).toBe(`seller-payments-v1-${contractIdSuffix('Seller Payments v1')}`)
  })

  it('detects legacy slug-only ids', () => {
    expect(isLegacySlugOnlyContractId('seller-payments-v1', 'Seller Payments v1')).toBe(true)
    expect(isLegacySlugOnlyContractId('seller-payments-v1-a3f91c2b', 'Seller Payments v1')).toBe(false)
  })

  it('rejects ids without hybrid suffix or with invalid characters', () => {
    expect(isValidContractId('seller-payments-v1')).toBe(false)
    expect(isValidContractId('Seller-Payments-V1-abcdef12')).toBe(false)
    expect(isValidContractId('seller_payments_v1-abcdef12')).toBe(false)
    expect(isValidContractId('seller-payments-v1-abcdef12')).toBe(true)
  })

  it('stable schema and property ids are unchanged', () => {
    expect(stableSchemaId('orders')).toBe('tbl-orders')
    expect(stablePropertyId('tbl-orders', 'TXN_REF_DT')).toBe('tbl_orders_txn_ref_dt_prop')
  })
})
