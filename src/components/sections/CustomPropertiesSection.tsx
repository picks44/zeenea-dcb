import { Settings2 } from 'lucide-react'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import { CustomPropertiesEditor } from '@/components/shared/CustomPropertiesEditor'
import { CustomPropertyDocRow } from '@/components/shared/CustomPropertyDocRow'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { filterCustomPropertiesForSave } from '@/lib/odcsSharedMappers'
import type { CustomProperty } from '@/types/odcsShared'
import {
  GOVERNANCE_EMPTY_SECTION_WIDTH_CLASS,
  GOVERNANCE_SECTION_WIDTH_FULL_CLASS,
  GOVERNANCE_SECTION_WIDTH_NARROW_CLASS,
} from '@/lib/governanceLayout'
import { generateId, cn } from '@/lib/utils'
import { GovernanceSectionMeta } from '@/components/shared/GovernanceSectionMeta'
import { summarizeCustomProperties } from '@/lib/governanceSectionSummary'
import {
  CUSTOM_PROPERTIES_AUTOSAVE_NOTE,
  CUSTOM_PROPERTIES_EMPTY_BODY,
  CUSTOM_PROPERTIES_EMPTY_CTA,
  CUSTOM_PROPERTIES_EMPTY_TITLE,
  CUSTOM_PROPERTIES_INTRO,
  formatCustomPropertiesSummaryLine,
} from '@/lib/uxCopy'
import { useReadinessNavigation } from '@/components/readiness/ReadinessNavigationContext'

interface CustomPropertiesSectionProps {
  customProperties: CustomProperty[]
  onChange: (props: CustomProperty[]) => void
  isLocked: boolean
  docCompact?: boolean
}

export function CustomPropertiesSection({
  customProperties,
  onChange,
  isLocked,
  docCompact,
}: CustomPropertiesSectionProps) {
  const rows = customProperties ?? []
  const isEmpty = rows.length === 0
  const readinessNav = useReadinessNavigation()
  const publishAttempted = readinessNav?.publishAttempted ?? false
  const customSummary = summarizeCustomProperties(rows)
  const summaryLine = formatCustomPropertiesSummaryLine(
    customSummary.includedInYaml,
    customSummary.incomplete,
  )

  return (
    <div
      className={cn(
        GOVERNANCE_SECTION_WIDTH_FULL_CLASS,
        isEmpty ? GOVERNANCE_EMPTY_SECTION_WIDTH_CLASS : GOVERNANCE_SECTION_WIDTH_NARROW_CLASS,
      )}
    >
      <ContractSectionHeader
        title="Custom properties"
        description={CUSTOM_PROPERTIES_INTRO}
        compact={docCompact && isLocked}
      />

      {!isLocked ? (
        <GovernanceSectionMeta
          autosaveNote={CUSTOM_PROPERTIES_AUTOSAVE_NOTE}
          summaryLine={summaryLine}
        />
      ) : null}

      {rows.length === 0 ? (
        <GovernanceEmptyState
          icon={Settings2}
          title={CUSTOM_PROPERTIES_EMPTY_TITLE}
          body={CUSTOM_PROPERTIES_EMPTY_BODY}
          ctaLabel={CUSTOM_PROPERTIES_EMPTY_CTA}
          onCta={() => onChange([{ id: generateId(), property: '', value: '', description: '' }])}
          isLocked={isLocked}
        />
      ) : isLocked ? (
        <GovernanceDocList>
          {rows.map(row => (
            <CustomPropertyDocRow key={row.id} property={row} compact={docCompact} />
          ))}
        </GovernanceDocList>
      ) : (
        <CustomPropertiesEditor
          properties={rows}
          onChange={next => onChange(filterCustomPropertiesForSave(next))}
          publishAttempted={publishAttempted}
        />
      )}
    </div>
  )
}
