import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>
>(({ className, indeterminate, ...props }, ref) => (
  <BaseCheckbox.Root
    ref={ref}
    indeterminate={indeterminate}
    className={cn(
      'relative h-4 w-4 shrink-0 rounded border border-neutral-200 bg-white transition-colors',
      'before:absolute before:inset-[-4px] before:rounded-[6px] before:bg-transparent before:transition-colors',
      'hover:before:bg-neutral-100/30',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:before:bg-transparent',
      'data-[checked]:bg-blue-700 data-[checked]:border-blue-700',
      'data-[indeterminate]:bg-blue-700 data-[indeterminate]:border-blue-700',
      className
    )}
    {...props}
  >
    <BaseCheckbox.Indicator className="flex items-center justify-center text-white">
      {indeterminate
        ? <Minus className="h-3 w-3" strokeWidth={3} />
        : <Check className="h-3 w-3" strokeWidth={3} />
      }
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
