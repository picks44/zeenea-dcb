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
 * Required-field wrapper with progressive emphasis:
 * - Draft: muted "Required" badge only
 * - Guided / publish attempt: temporary orange highlight on missing fields
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
  const { setRef, showRequiredBadge, showEmphasis } = useReadinessField(fieldId, isMissing, required)

  return (
    <div
      ref={setRef}
      className={cn(
        className,
        showEmphasis && 'rounded-md border border-[#fed7aa] bg-[#fff7ed]/80 px-2.5 py-2 -mx-0.5 transition-colors duration-200',
      )}
    >
      <label className="text-xs font-medium text-[#33333d] mb-1 block">
        {label}
        {showRequiredBadge && required ? (
          <span
            className={cn(
              'ml-1.5 text-[10px] font-normal',
              showEmphasis ? 'text-[#b8956a]' : 'text-[#9898a7]',
            )}
          >
            Required
          </span>
        ) : null}
      </label>
      {children}
      {showEmphasis && missingHelper ? (
        <p className="text-[10px] text-[#b8956a] mt-1 leading-snug">{missingHelper}</p>
      ) : null}
    </div>
  )
}
