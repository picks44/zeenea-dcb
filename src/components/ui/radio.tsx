import * as React from 'react'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { cn } from '@/lib/utils'

const RadioGroupRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadioGroup>
>(({ className, ...props }, ref) => (
  <RadioGroup
    ref={ref}
    className={cn('flex flex-col gap-2', className)}
    {...props}
  />
))
RadioGroupRoot.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Radio.Root>
>(({ className, ...props }, ref) => (
  <Radio.Root
    ref={ref}
    className={cn(
      'relative flex items-center justify-center h-4 w-4 rounded-full border border-neutral-200 bg-white transition-colors',
      'before:absolute before:inset-[-4px] before:rounded-full before:bg-transparent before:transition-colors',
      'hover:before:bg-neutral-100/30',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:before:bg-transparent',
      'data-[checked]:bg-blue-700 data-[checked]:border-blue-700',
      className
    )}
    {...props}
  >
    <Radio.Indicator className="h-[6px] w-[6px] rounded-full bg-white" />
  </Radio.Root>
))
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroupRoot as RadioGroup, RadioGroupItem }
