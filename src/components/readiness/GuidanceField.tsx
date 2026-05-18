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
 * Progressive required/recommended field wrapper:
 * - Draft: scannable tint + badge (not an error state)
 * - Guided / publish: stronger emphasis + optional helper
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
  const { setRef, showRequiredBadge, showEmphasis, showDraftScan } = useReadinessField(
    fieldId,
    isMissing,
    required,
  )

  return (
    <div
      ref={setRef}
      className={cn(
        className,
        showDraftScan && required && 'rounded-md border border-[#e4e2dc] bg-[#fafaf8] px-2.5 py-2 -mx-0.5',
        showDraftScan && !required && 'rounded-md border border-[#ebebf0] bg-[#fcfcfd] px-2.5 py-2 -mx-0.5',
        showEmphasis && 'rounded-md border border-[#fed7aa] bg-[#fff7ed]/80 px-2.5 py-2 -mx-0.5 transition-colors duration-200',
      )}
    >
      <label
        className={cn(
          'text-xs mb-1 block',
          showDraftScan && required ? 'font-semibold text-[#2a2a35]' : 'font-medium text-[#33333d]',
        )}
      >
        {label}
        {showRequiredBadge && required ? (
          <span
            className={cn(
              'ml-1.5 inline-flex items-center text-[9px] font-medium uppercase tracking-wide rounded px-1 py-px',
              showEmphasis
                ? 'text-[#b8956a] bg-[#fff7ed]'
                : 'text-[#656574] bg-[#eef0f4]',
            )}
          >
            Required
          </span>
        ) : null}
        {showRequiredBadge && !required ? (
          <span className="ml-1.5 text-[9px] font-medium text-[#9898a7]">Suggested</span>
        ) : null}
      </label>
      {children}
      {showEmphasis && missingHelper ? (
        <p className="text-[10px] text-[#b8956a] mt-1 leading-snug">{missingHelper}</p>
      ) : null}
    </div>
  )
}
