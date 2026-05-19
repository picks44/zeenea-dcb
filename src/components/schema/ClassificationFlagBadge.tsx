import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import type { ClassificationValue } from '@/lib/p1Constants'
import { cn } from '@/lib/utils'
import {
  classificationActiveColor,
  classificationShortLabel,
  classificationTooltip,
} from './classificationCycle'

interface ClassificationFlagBadgeProps {
  classification?: ClassificationValue
  onClick?: () => void
  disabled: boolean
  shape?: 'left' | 'mid' | 'right'
  compact?: boolean
}

export function ClassificationFlagBadge({
  classification,
  onClick,
  disabled,
  shape = 'mid',
  compact,
}: ClassificationFlagBadgeProps) {
  const active = Boolean(classification)
  const label = classificationShortLabel(classification)
  const tooltip = classificationTooltip(classification)

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
                'font-bold border transition-all select-none min-w-[2rem] text-center',
                compact ? 'h-5 px-1 text-[10px]' : 'h-7 px-1.5 text-[11px]',
                shape === 'left' && 'rounded-l-md',
                shape === 'mid' && 'rounded-none -ml-px',
                shape === 'right' && 'rounded-r-md -ml-px',
                active
                  ? cn(classificationActiveColor(classification), 'relative z-10')
                  : 'bg-transparent text-neutral-300 border-neutral-200',
                !disabled && !active && 'hover:text-neutral-400 hover:border-neutral-200 hover:z-10 hover:relative',
                !disabled && 'cursor-pointer',
                disabled && 'cursor-default',
              )}
            />
          }
        >
          {label}
        </BaseTooltip.Trigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
