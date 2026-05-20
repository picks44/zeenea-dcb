import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

/**
 * Shared empty state for governance/configuration sections.
 * Baseline: Stakeholders - dashed card, compact density, outline CTA, one action only.
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
        'border border-dashed border-neutral-200 rounded-xl px-6 py-7',
        'flex flex-col items-center text-center bg-neutral-25/40',
        className,
      )}
    >
      <EmptyState
        icon={<Icon className="h-6 w-6" />}
        title={title}
        description={body}
        className="gap-3"
      />
      {!isLocked && onCta ? (
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="outline" onClick={onCta} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
