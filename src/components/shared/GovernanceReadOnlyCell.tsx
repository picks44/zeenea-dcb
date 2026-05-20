import { cn } from '@/lib/utils'

interface GovernanceReadOnlyCellProps {
  value: string
  /** Use monospace for technical values (e.g. element paths). */
  mono?: boolean
  className?: string
}

/** Compact text cell for published / read-only governance table rows. */
export function GovernanceReadOnlyCell({ value, mono, className }: GovernanceReadOnlyCellProps) {
  const trimmed = value.trim()

  return (
    <span
      className={cn(
        'text-xs truncate block min-w-0',
        trimmed ? 'text-[#656574]' : 'text-[#9898a7]',
        mono && trimmed && 'font-mono text-[11px]',
        className,
      )}
      title={trimmed || undefined}
    >
      {trimmed || '-'}
    </span>
  )
}
