import { SectionGuidanceHint } from '@/components/readiness/SectionGuidanceBanner'
import { cn } from '@/lib/utils'

export interface GovernanceSectionMetaProps {
  autosaveNote: string
  /** Section counters, e.g. "2 contacts saved · app-only" */
  summaryLine?: string | null
  guidanceHint?: string | null
  className?: string
}

/** Discreet autosave + section counters below ContractSectionHeader. */
export function GovernanceSectionMeta({
  autosaveNote,
  summaryLine,
  guidanceHint,
  className,
}: GovernanceSectionMetaProps) {
  const showSummary = Boolean(summaryLine?.trim())

  return (
    <div className={cn('-mt-4 mb-4 space-y-1', className)}>
      <p className="text-[11px] text-[#9898a7] leading-snug">{autosaveNote}</p>
      {showSummary ? (
        <p className="text-[11px] text-[#656574] leading-snug tabular-nums" role="status">
          {summaryLine}
        </p>
      ) : null}
      {guidanceHint ? (
        <SectionGuidanceHint message={guidanceHint} className="mb-0 mt-1" />
      ) : null}
    </div>
  )
}
