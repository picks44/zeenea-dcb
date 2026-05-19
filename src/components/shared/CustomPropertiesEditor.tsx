import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CustomProperty } from '@/types/odcsShared'
import { generateId, cn } from '@/lib/utils'
import { governanceTableFooterActionClass } from '@/components/shared/GovernanceSectionHeader'
import { GovernanceDeleteButton } from '@/components/shared/GovernanceDeleteButton'
import { isValidCustomPropertyName } from '@/lib/p1Validation'
import { CUSTOM_PROPERTIES_EMPTY_CTA } from '@/lib/uxCopy'

interface CustomPropertiesEditorProps {
  properties: CustomProperty[]
  onChange: (props: CustomProperty[]) => void
}

function emptyRow(): CustomProperty {
  return { id: generateId(), property: '', value: '', description: '' }
}

export function CustomPropertiesEditor({
  properties,
  onChange,
}: CustomPropertiesEditorProps) {
  const update = (id: string, patch: Partial<CustomProperty>) => {
    onChange(properties.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }

  return (
    <div className="space-y-2">
      {properties.map(row => {
        const nameError = row.property.trim() && !isValidCustomPropertyName(row.property)
          ? 'Use camelCase (e.g. dataSteward).'
          : null
        return (
          <div key={row.id} className="border border-neutral-200 rounded-lg p-3 space-y-2 relative">
            <GovernanceDeleteButton
              onClick={() => onChange(properties.filter(p => p.id !== row.id))}
              aria-label="Remove custom property"
              className="absolute top-2 right-2"
            />
            <div className="grid grid-cols-2 gap-2 pr-8">
              <div>
                <label className="text-[10px] font-medium text-neutral-400 mb-0.5 block">Property</label>
                <Input
                  value={row.property}
                  onChange={e => update(row.id, { property: e.target.value })}
                  placeholder="dataSteward"
                  className={cn('h-8 text-xs font-mono', nameError && 'border-red-700')}
                />
                {nameError ? <p className="text-[10px] text-red-700 mt-0.5">{nameError}</p> : null}
              </div>
              <div>
                <label className="text-[10px] font-medium text-neutral-400 mb-0.5 block">Value</label>
                <Input
                  value={row.value}
                  onChange={e => update(row.id, { value: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-neutral-400 mb-0.5 block">Description (optional)</label>
              <Textarea
                value={row.description ?? ''}
                onChange={e => update(row.id, { description: e.target.value })}
                placeholder="Owner responsible for data quality."
                rows={2}
                className="text-xs min-h-[56px] resize-y"
              />
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => onChange([...properties, emptyRow()])}
        className={governanceTableFooterActionClass}
      >
        <Plus className="h-3.5 w-3.5" />
        {CUSTOM_PROPERTIES_EMPTY_CTA}
      </button>
    </div>
  )
}
