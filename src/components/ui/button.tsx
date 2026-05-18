import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Minimal Slot: merges props onto a single child element (replaces @radix-ui/react-slot)
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, className, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        className: cn(className, (child.props as { className?: string }).className),
        ref,
      })
    }
    return <>{children}</>
  }
)
Slot.displayName = 'Slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium tracking-[0.2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:bg-neutral-50 disabled:text-neutral-300 disabled:border-neutral-200',
  {
    variants: {
      variant: {
        default:     'bg-blue-700 text-white hover:bg-blue-800 shadow-sm',
        secondary:   'border border-blue-700 bg-white text-blue-700 hover:bg-blue-25',
        outline:     'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300',
        ghost:       'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
        destructive: 'bg-red-700 text-white hover:bg-red-800 shadow-sm',
        link:        'text-blue-700 underline-offset-4 hover:underline',
        success:     'bg-green-700 text-white hover:bg-green-800 shadow-sm',
        warning:     'border border-[#ffd599] bg-[#fff8ec] text-[#d27b00] hover:bg-[#ffebce]',
      },
      size: {
        default:   'h-8 px-3 py-1.5',
        sm:        'h-7 px-2.5 text-xs',
        lg:        'h-10 px-4',
        icon:      'h-8 w-8',
        'icon-sm': 'h-6 w-6 rounded-[6px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
