import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReadinessField } from '@/components/readiness/ReadinessNavigationContext'

interface GuidanceFieldProps {
  fieldId: string
  label: ReactNode
  required?: boolean
  isMissing: boolean
  missingHelper?: string
  className?: string
  children: ReactNode
}

/**
 * Progressive required field wrapper:
 * - Draft: reinforced label + Required badge
 * - Panel navigation: outline pulse on control (CSS via flashElement)
 * - Publish attempted: orange label/badge + helper + control border
 */
export function GuidanceField({
  fieldId,
  label,
  required = true,
  isMissing,
  missingHelper,
  className,
  children,
}: GuidanceFieldProps) {
  const { setRef, showRequiredBadge, showEmphasis } = useReadinessField(
    fieldId,
    isMissing,
    required,
  )

  return (
    <div ref={setRef} className={className}>
      <label
        className={cn(
          'text-xs mb-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5',
          showRequiredBadge && required ? 'font-semibold text-[#2a2a35]' : 'font-medium text-[#33333d]',
          showEmphasis && required && 'text-[#8a5c00]',
        )}
      >
        {label}
        {showRequiredBadge && required ? (
          <span
            className={cn(
              'inline-flex items-center text-[9px] font-medium uppercase tracking-wide rounded border px-1 py-px',
              showEmphasis
                ? 'text-[#b8956a] border-[#f5d9b8] bg-[#fff7ed]'
                : 'text-[#8a5c00] border-[#f0e0c8] bg-[#fffbf5]',
            )}
          >
            Required
          </span>
        ) : null}
      </label>
      <div
        className={cn(
          showEmphasis
            && required
            && '[&_input]:border-[#f5d9b8] [&_textarea]:border-[#f5d9b8] [&_select]:border-[#f5d9b8] [&_[data-readiness-control]]:border-[#f5d9b8]',
        )}
      >
        {children}
      </div>
      {showEmphasis && missingHelper ? (
        <p className="text-[10px] text-[#b8956a] mt-1 leading-snug">{missingHelper}</p>
      ) : null}
    </div>
  )
}

