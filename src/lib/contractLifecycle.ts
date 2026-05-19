import type { LifecycleStatus } from '@/types/odcs'

/** System-managed lifecycle transitions (P1 — not user-editable). */
export const LIFECYCLE_TRANSITIONS: Record<LifecycleStatus, readonly LifecycleStatus[]> = {
  proposed: ['draft'],
  draft: ['active'],
  active: ['deprecated'],
  deprecated: ['retired'],
  retired: [],
}

export type LifecycleAction = 'start_draft' | 'publish' | 'deprecate' | 'retire'

export function canTransitionStatus(from: LifecycleStatus, to: LifecycleStatus): boolean {
  return LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false
}

export function applyLifecycleAction(status: LifecycleStatus, action: LifecycleAction): LifecycleStatus {
  switch (action) {
    case 'start_draft':
      return status === 'proposed' ? 'draft' : status
    case 'publish':
      return canTransitionStatus(status, 'active') || status === 'draft' ? 'active' : status
    case 'deprecate':
      return status === 'active' ? 'deprecated' : status
    case 'retire':
      return status === 'deprecated' ? 'retired' : status
    default:
      return status
  }
}

/** Publish is allowed from draft, or from active while in revision. */
export function canPublishFromStatus(status: LifecycleStatus, inRevision?: boolean): boolean {
  if (inRevision && status === 'active') return true
  return status === 'draft'
}

export function isContractEditableStatus(status: LifecycleStatus, inRevision?: boolean): boolean {
  if (status === 'retired' || status === 'deprecated') return false
  if (status === 'active' && !inRevision) return false
  return true
}
