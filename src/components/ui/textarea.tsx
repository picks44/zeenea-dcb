import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded border border-neutral-200 bg-white px-2 py-2 text-sm tracking-[0.2px] transition-colors',
          'placeholder:text-neutral-500',
          'hover:border-neutral-300',
          'focus-visible:outline-none focus-visible:border-2 focus-visible:border-blue-700',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300 disabled:border-neutral-200',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
