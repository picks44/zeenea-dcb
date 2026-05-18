import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded border border-neutral-200 bg-white px-2 py-2 text-sm tracking-[0.2px] transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-neutral-500',
          'hover:border-neutral-300',
          'focus-visible:outline-none focus-visible:border-2 focus-visible:border-blue-700',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300 disabled:border-neutral-200 disabled:placeholder:text-neutral-300',
          'read-only:bg-neutral-50 read-only:border-neutral-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
