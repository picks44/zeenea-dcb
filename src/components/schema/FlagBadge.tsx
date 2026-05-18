import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const FLAG_CONFIG: Record<string, { title: string; color: string }> = {
  PK:  { title: 'Primary Key — uniquely identifies each row',        color: 'bg-orange-50 text-orange-700 border-orange-100'  },
  REQ: { title: 'Required — this field cannot be empty',            color: 'bg-red-50 text-red-700 border-red-100'            },
  PII: { title: 'Personal Data — contains private user information', color: 'bg-orange-100 text-orange-700 border-orange-100' },
  UQ:  { title: 'Unique — no two rows can have the same value',     color: 'bg-blue-50 text-blue-700 border-blue-100'         },
}

interface FlagBadgeProps {
  flag: keyof typeof FLAG_CONFIG
  active: boolean
  onClick?: () => void
  disabled: boolean
  shape?: 'left' | 'mid' | 'right'
}

export function FlagBadge({ flag, active, onClick, disabled, shape = 'mid' }: FlagBadgeProps) {
  const { title, color } = FLAG_CONFIG[flag]
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
                'h-7 px-2.5 text-[11px] font-bold border transition-all select-none',
                shape === 'left'  && 'rounded-l-md',
                shape === 'mid'   && 'rounded-none -ml-px',
                shape === 'right' && 'rounded-r-md -ml-px',
                active ? cn(color, 'relative z-10') : 'bg-transparent text-[#9898a7] border-[#d3d3e5]',
                !disabled && !active && 'hover:text-[#656574] hover:border-[#d3d3e5] hover:z-10 hover:relative',
                !disabled && 'cursor-pointer',
                disabled && 'cursor-default'
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
