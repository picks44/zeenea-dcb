import type { DataContract } from '@/types/odcs'
import {
  READINESS_FIELD_CONTRACT_DOMAIN,
  READINESS_FIELD_CONTRACT_PURPOSE,
  READINESS_FIELD_FUNDAMENTALS_REF_LINKS,
  READINESS_FIELD_STAKEHOLDERS_ROOT,
} from '@/lib/uxCopy'

export {
  READINESS_FIELD_CONTRACT_DOMAIN,
  READINESS_FIELD_CONTRACT_PURPOSE,
  READINESS_FIELD_FUNDAMENTALS_REF_LINKS,
  READINESS_FIELD_STAKEHOLDERS_ROOT,
}

/** Stable anchor id for a schema column row (table index + column index). */
export function schemaFieldAnchorId(tableIndex: number, columnIndex: number): string {
  return `schema-field-${tableIndex}-${columnIndex}`
}

export function findFirstUndocumentedField(
  contract: DataContract,
): { fieldId: string; tableIndex: number; columnIndex: number } | null {
  for (let ti = 0; ti < contract.dataset.length; ti++) {
    const table = contract.dataset[ti]
    for (let ci = 0; ci < table.columns.length; ci++) {
      if (!table.columns[ci].description.trim()) {
        return { fieldId: schemaFieldAnchorId(ti, ci), tableIndex: ti, columnIndex: ci }
      }
    }
  }
  return null
}

export function countUndocumentedFields(contract: DataContract): number {
  return contract.dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => !c.description.trim()).length,
    0,
  )
}
