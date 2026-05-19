import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DOC_COMPACT_SPACING } from '@/components/shared/docViewTokens'
import {
  WorkflowMetadataPill,
  type WorkflowMetadataPillVariant,
} from '@/components/shared/WorkflowMetadataPill'

export interface ContractSectionHeaderProps {
  title: string
  description?: string
  conceptTag?: string
  action?: ReactNode
  compact?: boolean
  /** Outline flash target for readiness navigation (h2 only). */
  flashTitle?: boolean
  /** Workflow pill on a dedicated metadata line below the description. */
  metadataVariant?: WorkflowMetadataPillVariant
  /** Optional copy beside the metadata pill (e.g. Versions intro). */
  metadataNote?: ReactNode
}

export function contractSectionHeaderMarginClass(compact?: boolean): string {
  return compact ? DOC_COMPACT_SPACING.sectionHeader : 'mb-6'
}

/** Shared h2 + description rhythm for contract form sections. */
export function ContractSectionHeader({
  title,
  description,
  conceptTag,
  action,
  compact,
  flashTitle,
  metadataVariant,
  metadataNote,
}: ContractSectionHeaderProps) {
  const showMetadata = metadataVariant != null || metadataNote != null

  return (
    <div className={cn('flex items-start justify-between gap-4', contractSectionHeaderMarginClass(compact))}>
      <div className="min-w-0">
        {conceptTag ? (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9898a7] mb-1">{conceptTag}</p>
        ) : null}
        <h2
          data-readiness-flash={flashTitle ? '' : undefined}
          className={cn(
            'text-base font-semibold text-[#12131f]',
            flashTitle && 'inline-block rounded',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-[#3f3f4a] text-xs mt-0.5 leading-relaxed">{description}</p>
        ) : null}
        {showMetadata ? (
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-xs leading-relaxed text-[#3f3f4a]">
            {metadataNote ? <span>{metadataNote}</span> : null}
            {metadataVariant ? <WorkflowMetadataPill variant={metadataVariant} /> : null}
          </div>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  )
}
