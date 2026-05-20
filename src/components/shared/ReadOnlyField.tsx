import { cn } from '@/lib/utils'

interface ReadOnlyFieldProps {
  label: string
  value: string
  required?: boolean
  mono?: boolean
  multiline?: boolean
  compact?: boolean
}

/** Label + value display for published / read-only contract views. */
export function ReadOnlyField({ label, value, required, mono, multiline, compact }: ReadOnlyFieldProps) {
  const trimmed = value.trim()
  const empty = !trimmed

  return (
    <div>
      <span
        className={cn(
          'font-medium text-[#33333d] block',
          compact ? 'text-[11px] mb-0.5' : 'text-xs mb-1',
        )}
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <p
        className={cn(
          compact ? 'text-[12px] leading-snug' : 'text-sm leading-snug',
          empty ? 'text-[#9898a7]' : 'text-[#33333d]',
          mono && !empty && 'font-mono',
          multiline && !empty && 'whitespace-pre-wrap',
        )}
      >
        {empty ? '-' : trimmed}
      </p>
    </div>
  )
}
