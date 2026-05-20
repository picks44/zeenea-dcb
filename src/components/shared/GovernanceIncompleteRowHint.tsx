import { cn } from '@/lib/utils'

interface GovernanceIncompleteRowHintProps {
  show: boolean
  message: string
  className?: string
}

/** Publish-attempt emphasis for incomplete governance rows (not shown while typing). */
export function GovernanceIncompleteRowHint({
  show,
  message,
  className,
}: GovernanceIncompleteRowHintProps) {
  if (!show) return null
  return (
    <p className={cn('text-[10px] text-[#b8956a] leading-snug mt-1', className)} role="alert">
      {message}
    </p>
  )
}

/** Wrapper class when a row should show publish emphasis. */
export function governanceIncompleteRowClass(show: boolean): string {
  return show ? 'outline outline-1 outline-[#f5d9b8] -outline-offset-1 rounded-sm' : ''
}
