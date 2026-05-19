/** Row count at or below which locked governance sections use compact doc layout. */
export const GOVERNANCE_COMPACT_READONLY_THRESHOLD = 2

export function shouldUseCompactReadOnly(
  isLocked: boolean,
  rowCount: number,
  threshold = GOVERNANCE_COMPACT_READONLY_THRESHOLD,
): boolean {
  return isLocked && rowCount > 0 && rowCount <= threshold
}
