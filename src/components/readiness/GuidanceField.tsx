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

/** Wraps a form field with soft required-missing guidance (not publish-attempt red). */
export function GuidanceField({
  fieldId,
  label,
  required,
  isMissing,
  missingHelper,
  className,
  children,
}: GuidanceFieldProps) {
  const { setRef, showGuidance } = useReadinessField(fieldId, isMissing)

  return (
    <div
      ref={setRef}
      className={cn(
        className,
        showGuidance && 'rounded-md border border-[#fed7aa] bg-[#fff7ed] px-2.5 py-2 -mx-0.5',
      )}
    >
      <label className="text-xs font-medium text-[#33333d] mb-1 block">
        {label}
        {required ? (
          <span className="ml-1.5 text-[10px] font-normal text-[#d27b00]">Required</span>
        ) : null}
      </label>
      {children}
      {showGuidance && missingHelper ? (
        <p className="text-[10px] text-[#d27b00] mt-1 leading-snug">{missingHelper}</p>
      ) : null}
    </div>
  )
}
