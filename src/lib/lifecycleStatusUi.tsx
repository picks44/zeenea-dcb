import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  FilePen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import type { LifecycleStatus } from '@/types/odcs'
import { LIFECYCLE_STATUS_TOOLTIPS } from '@/lib/uxCopy'
import { cn } from '@/lib/utils'

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  proposed: 'Proposed',
  draft: 'Draft',
  active: 'Active',
  deprecated: 'Deprecated',
  retired: 'Retired',
}

export const LIFECYCLE_STATUS_ICONS: Record<LifecycleStatus, LucideIcon> = {
  proposed: CircleDashed,
  draft: FilePen,
  active: CheckCircle2,
  deprecated: AlertTriangle,
  retired: Archive,
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
  const Icon = LIFECYCLE_STATUS_ICONS[status]
  const label = LIFECYCLE_STATUS_LABELS[status]
  const badge = (
    <Badge
      variant={status}
      className={cn(
        'inline-flex h-8 items-center justify-center gap-1.5 px-2.5 py-0 text-xs leading-none cursor-help',
        className,
      )}
    >
      <span className="flex size-3 shrink-0 items-center justify-center" aria-hidden>
        <Icon className="size-3" strokeWidth={2} />
      </span>
      <span className="leading-none">{label}</span>
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
