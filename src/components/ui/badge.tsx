import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-blue-700 text-white',
        secondary:   'border-neutral-200 bg-neutral-50 text-neutral-600',
        outline:     'border-neutral-200 bg-transparent text-neutral-600',
        destructive: 'border-transparent bg-red-700 text-white',
        draft:       'border-cyan-100 bg-cyan-25 text-cyan-700',
        active:      'border-green-100 bg-green-25 text-green-700',
        deprecated:  'border-red-100 bg-red-25 text-red-700',
        owner:       'border-transparent bg-[#12131f] text-white',
        contributor: 'border-violet-200 bg-violet-50 text-violet-700',
        consumer:    'border-neutral-200 bg-neutral-50 text-neutral-500',
        tag:         'border-neutral-200 bg-blue-25 text-blue-700',
        version:     'border-neutral-200 bg-neutral-50 text-neutral-600 font-mono',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
