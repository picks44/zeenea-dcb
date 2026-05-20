import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import type { LifecycleStatus } from '@/types/odcs'
import {
  LIFECYCLE_STATUS_TOOLTIPS,
  TOP_BAR_REVISION_OPEN_LABEL,
  TOP_BAR_REVISION_OPEN_TOOLTIP,
} from '@/lib/uxCopy'
import { cn } from '@/lib/utils'

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  proposed: 'Proposed',
  draft: 'Draft',
  active: 'Active',
  deprecated: 'Deprecated',
  retired: 'Retired',
}

export function LifecycleStatusBadge({
  status,
  className,
  tooltipSide = 'bottom',
}: {
  status: LifecycleStatus
  className?: string
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}) {
  const label = LIFECYCLE_STATUS_LABELS[status]
  const badge = (
    <Badge variant={status} className={cn('cursor-help', className)}>
      {label}
    </Badge>
  )

  return (
    <Tooltip content={LIFECYCLE_STATUS_TOOLTIPS[status]} side={tooltipSide} delayDuration={400}>
      <span
        className="inline-flex shrink-0 items-center self-center align-middle"
        tabIndex={0}
        aria-label={`${label}: ${LIFECYCLE_STATUS_TOOLTIPS[status]}`}
      >
        {badge}
      </span>
    </Tooltip>
  )
}

/** Shown in the contract top bar when editing an unpublished revision (active + inRevision). */
export function RevisionOpenBadge({
  className,
  tooltipSide = 'bottom',
}: {
  className?: string
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <Tooltip content={TOP_BAR_REVISION_OPEN_TOOLTIP} side={tooltipSide} delayDuration={400}>
      <span
        className="inline-flex shrink-0 items-center self-center align-middle"
        tabIndex={0}
        aria-label={`${TOP_BAR_REVISION_OPEN_LABEL}: ${TOP_BAR_REVISION_OPEN_TOOLTIP}`}
      >
        <Badge
          variant="outline"
          className={cn(
            'cursor-help border-orange-100 bg-orange-25 text-orange-700',
            className,
          )}
        >
          {TOP_BAR_REVISION_OPEN_LABEL}
        </Badge>
      </span>
    </Tooltip>
  )
}
