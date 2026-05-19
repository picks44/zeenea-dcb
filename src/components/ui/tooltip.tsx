import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '@/lib/utils'

const TooltipProvider = BaseTooltip.Provider
const TooltipRoot = BaseTooltip.Root
const TooltipTrigger = BaseTooltip.Trigger

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> & {
    sideOffset?: number
    side?: 'top' | 'bottom' | 'left' | 'right'
  }
>(({ className, sideOffset = 6, side = 'top', ...props }, ref) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner side={side} sideOffset={sideOffset} className="z-50">
      <BaseTooltip.Popup
        ref={ref}
        className={cn(
          'z-50 max-w-[240px] rounded bg-neutral-900 px-2 py-2',
          'text-white text-[12px] font-normal leading-[16px] tracking-[0.3px]',
          'data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
          'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
))
TooltipContent.displayName = 'TooltipContent'

function Tooltip({
  children,
  content,
  delayDuration = 1000,
  side = 'top',
}: {
  children: React.ReactNode
  content: React.ReactNode
  delayDuration?: number
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <BaseTooltip.Provider delay={delayDuration}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={<span className="inline-flex items-center" />}>
          {children}
        </BaseTooltip.Trigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}

export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }
