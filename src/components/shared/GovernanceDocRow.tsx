import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DOC_COMPACT_ROW } from '@/components/shared/docViewTokens'

interface GovernanceDocRowProps {
  primary: ReactNode
  secondary?: ReactNode
  tertiary?: ReactNode
  /** Single muted metadata line (role · contact · notes) */
  metaLine?: ReactNode
  className?: string
  compact?: boolean
}

/** Compact documentation-style row for low-density governance data. */
export function GovernanceDocRow({
  primary,
  secondary,
  tertiary,
  metaLine,
  className,
  compact,
}: GovernanceDocRowProps) {
  if (metaLine) {
    return (
      <div className={cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2', className)}>
        <div className="text-xs font-medium text-[#12131f] leading-snug">{primary}</div>
        <p className="text-[11px] text-[#656574] mt-0.5 leading-snug truncate">{metaLine}</p>
      </div>
    )
  }

  return (
    <div className={cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2', className)}>
      <div className="text-xs font-medium text-[#12131f] leading-snug">{primary}</div>
      {secondary ? (
        <p className={cn('text-xs text-[#656574] leading-snug', compact ? 'mt-0.5' : 'mt-0.5')}>{secondary}</p>
      ) : null}
      {tertiary ? (
        <p className="text-[11px] text-[#9898a7] mt-0.5 leading-snug">{tertiary}</p>
      ) : null}
    </div>
  )
}
