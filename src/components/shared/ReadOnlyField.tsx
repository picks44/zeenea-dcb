import { cn } from '@/lib/utils'

interface ReadOnlyFieldProps {
  label: string
  value: string
  required?: boolean
  mono?: boolean
  multiline?: boolean
}

/** Label + value display for published / read-only contract views. */
export function ReadOnlyField({ label, value, required, mono, multiline }: ReadOnlyFieldProps) {
  const trimmed = value.trim()
  const empty = !trimmed

  return (
    <div>
      <span className="text-xs font-medium text-[#33333d] mb-1 block">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <p
        className={cn(
          'text-sm leading-snug',
          empty ? 'text-[#9898a7]' : 'text-[#33333d]',
          mono && !empty && 'font-mono text-[13px]',
          multiline && !empty && 'whitespace-pre-wrap',
        )}
      >
        {empty ? '—' : trimmed}
      </p>
    </div>
  )
}
