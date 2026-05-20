import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const FLAG_CONFIG = {
  PK:  { title: 'Primary Key - uniquely identifies each row',        color: 'bg-orange-50 text-orange-700 border-orange-100'  },
  REQ: { title: 'Required - this field cannot be empty',            color: 'bg-red-50 text-red-700 border-red-100'            },
  PII: { title: 'Personal Data - contains private user information', color: 'bg-orange-100 text-orange-700 border-orange-100' },
  UQ:  { title: 'Unique - no two rows can have the same value',     color: 'bg-blue-50 text-blue-700 border-blue-100'         },
  CDE: { title: 'Critical Data Element - governed as a critical asset', color: 'bg-green-50 text-green-700 border-green-100' },
} as const

type FlagKey = keyof typeof FLAG_CONFIG

interface FlagBadgeProps {
  flag: FlagKey
  active: boolean
  onClick?: () => void
  disabled: boolean
  shape?: 'left' | 'mid' | 'right'
  compact?: boolean
}

export function FlagBadge({ flag, active, onClick, disabled, shape = 'mid', compact }: FlagBadgeProps) {
  const config = FLAG_CONFIG[flag]
  if (!config) return null
  const { title, color } = config
  return (
    <BaseTooltip.Provider delay={600}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={
            <button
              type="button"
              onClick={disabled ? undefined : onClick}
              disabled={disabled}
              className={cn(
                'inline-flex items-center justify-center font-bold border leading-none transition-all select-none',
                compact ? 'h-5 min-w-[1.625rem] px-1 text-[10px]' : 'h-7 min-w-[2rem] px-1.5 text-[11px]',
                shape === 'left'  && 'rounded-l-md',
                shape === 'mid'   && 'rounded-none -ml-px',
                shape === 'right' && 'rounded-r-md -ml-px',
                active ? cn(color, 'relative z-10') : 'bg-transparent text-neutral-300 border-neutral-200',
                !disabled && !active && 'hover:text-neutral-400 hover:border-neutral-300 hover:z-10 hover:relative',
                !disabled && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-1 focus-visible:z-20',
                disabled && 'cursor-default opacity-90'
              )}
            />
          }
        >
          {flag}
        </BaseTooltip.Trigger>
        <TooltipContent side="top">{title}</TooltipContent>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
