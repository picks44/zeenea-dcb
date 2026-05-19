import { describe, expect, it } from 'vitest'
import { deriveContractId, isValidContractId, stablePropertyId, stableSchemaId } from '@/lib/idDerivation'

describe('idDerivation P1', () => {
  it('derives contract id from name', () => {
    expect(deriveContractId('Seller Payments v1')).toBe('seller-payments-v1')
    expect(isValidContractId('seller-payments-v1')).toBe(true)
  })

  it('stable schema and property ids', () => {
    expect(stableSchemaId('orders')).toBe('tbl-orders')
    expect(stablePropertyId('tbl-orders', 'TXN_REF_DT')).toBe('tbl_orders_txn_ref_dt_prop')
  })
})
