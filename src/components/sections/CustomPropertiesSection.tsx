import { Settings2 } from 'lucide-react'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import { CustomPropertiesEditor } from '@/components/shared/CustomPropertiesEditor'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { filterCustomPropertiesForSave } from '@/lib/odcsSharedMappers'
import type { CustomProperty } from '@/types/odcsShared'
import { generateId } from '@/lib/utils'
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

  return (
    <div className="max-w-[560px] w-full">
      <ContractSectionHeader
        title="Custom properties"
        description="Extend the contract with camelCase properties and values (ODCS customProperties)."
        compact={docCompact && isLocked}
      />

      {rows.length === 0 && isLocked ? (
        <p className="text-xs text-[#9898a7]">No custom properties defined.</p>
      ) : rows.length === 0 ? (
        <GovernanceEmptyState
          icon={Settings2}
          title="No custom properties"
          body="Add camelCase properties such as dataSteward or retentionPolicyRef."
          ctaLabel="Add custom property"
          onCta={() => onChange([{ id: generateId(), property: '', value: '', description: '' }])}
          isLocked={isLocked}
        />
      ) : (
        <CustomPropertiesEditor
          properties={rows}
          onChange={next => onChange(filterCustomPropertiesForSave(next))}
          disabled={isLocked}
        />
      )}
    </div>
  )
}
