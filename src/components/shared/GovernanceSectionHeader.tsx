import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GovernanceSectionHeaderProps {
  title: string
  description: ReactNode
  action?: ReactNode
}

/** Shared h2 + description rhythm for governance/configuration sections. */
export function GovernanceSectionHeader({ title, description, action }: GovernanceSectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#12131f]">{title}</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5 leading-relaxed">{description}</p>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  )
}

export const governanceTableShellClass =
  'border border-[#d3d3e5] rounded-xl overflow-hidden bg-white'

export const governanceTableHeadClass =
  'text-[10px] font-semibold uppercase tracking-wide text-[#656574]'

export const governanceTableHeadRowClass =
  'border-b border-[#e4e4f0] bg-[#fbfbff]/80 px-3 py-2'

export const governanceTableRowClass = 'px-3 py-1.5'

export const governanceTableFooterClass =
  'px-3 py-2.5 border-t border-[#e4e4f0] bg-[#fbfbff]/50'

/** Secondary table footer action — shared across Data access, SLA, etc. */
export const governanceTableFooterActionClass = cn(
  'inline-flex items-center gap-1.5 rounded-md -mx-0.5 px-1 py-0.5',
  'text-xs font-medium text-[#3f3f4a]',
  'hover:text-[#0550dc] hover:bg-[#f0f4ff]',
  'active:text-[#0343be] transition-colors',
)
