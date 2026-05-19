import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GovernanceDeleteButtonProps {
  onClick: () => void
  'aria-label': string
  className?: string
}

/** Shared row delete control for governance tables and card editors. */
export function GovernanceDeleteButton({
  onClick,
  'aria-label': ariaLabel,
  className,
}: GovernanceDeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-7 w-7 flex items-center justify-center text-neutral-300',
        'hover:text-red-700 hover:bg-red-25 rounded transition-colors',
        className,
      )}
      aria-label={ariaLabel}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
