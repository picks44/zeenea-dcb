import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GovernanceDocRowProps {
  primary: ReactNode
  secondary?: ReactNode
  tertiary?: ReactNode
  className?: string
}

/** Compact documentation-style row for low-density governance data. */
export function GovernanceDocRow({ primary, secondary, tertiary, className }: GovernanceDocRowProps) {
  return (
    <div className={cn('px-3 py-2', className)}>
      <div className="text-xs font-medium text-[#12131f] leading-snug">{primary}</div>
      {secondary ? (
        <p className="text-xs text-[#656574] mt-0.5 leading-snug">{secondary}</p>
      ) : null}
      {tertiary ? (
        <p className="text-[11px] text-[#9898a7] mt-0.5 leading-snug">{tertiary}</p>
      ) : null}
    </div>
  )
}
