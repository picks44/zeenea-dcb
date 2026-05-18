import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Shared empty state for governance/configuration sections.
 * Baseline: Stakeholders — dashed card, compact density, outline CTA, one action only.
 */
export interface GovernanceEmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
  ctaLabel: string
  onCta?: () => void
  isLocked?: boolean
  className?: string
}

export function GovernanceEmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  onCta,
  isLocked = false,
  className,
}: GovernanceEmptyStateProps) {
  return (
    <div
      className={cn(
        'border border-dashed border-[#d3d3e5] rounded-xl px-6 py-8',
        'flex flex-col items-center gap-2.5 text-center bg-[#fbfbff]/30',
        className,
      )}
    >
      <Icon className="h-5 w-5 text-[#656574]" aria-hidden />
      <div className="max-w-sm">
        <p className="text-sm font-medium text-[#12131f]">{title}</p>
        <p className="text-xs text-[#656574] mt-1 leading-relaxed">{body}</p>
      </div>
      {!isLocked && onCta ? (
        <Button size="sm" variant="outline" onClick={onCta} className="gap-1.5 mt-1">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  )
}
