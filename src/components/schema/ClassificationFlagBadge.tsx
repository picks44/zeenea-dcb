import { Shield } from 'lucide-react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import type { ClassificationValue } from '@/lib/p1Constants'
import { cn } from '@/lib/utils'
import {
  classificationIconButtonClass,
  classificationTooltip,
} from './classificationCycle'

interface ClassificationFlagBadgeProps {
  classification?: ClassificationValue
  onClick?: () => void
  disabled: boolean
  compact?: boolean
  className?: string
}

export function ClassificationFlagBadge({
  classification,
  onClick,
  disabled,
  compact,
  className,
}: ClassificationFlagBadgeProps) {
  const tooltip = classificationTooltip(classification)
  const hasValue = Boolean(classification)

  return (
    <BaseTooltip.Provider delay={600}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={
            <button
              type="button"
              onClick={disabled ? undefined : onClick}
              disabled={disabled}
              aria-label={tooltip}
              title={tooltip}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-md border transition-all select-none',
                compact ? 'h-5 w-5' : 'h-7 w-7',
                className,
                classificationIconButtonClass(classification, disabled),
                !disabled && !hasValue && 'border-dashed',
                !disabled && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-1',
                !disabled && hasValue && 'hover:shadow-sm',
                disabled && 'cursor-default opacity-90',
              )}
            />
          }
        >
          <Shield
            className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
            strokeWidth={hasValue ? 2.25 : 1.75}
            aria-hidden
          />
        </BaseTooltip.Trigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
