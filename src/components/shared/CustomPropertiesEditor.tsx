import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CustomProperty } from '@/types/odcsShared'
import { generateId, cn } from '@/lib/utils'
import { governanceTableFooterActionClass } from '@/components/shared/GovernanceSectionHeader'
import { isValidCustomPropertyName } from '@/lib/p1Validation'

interface CustomPropertiesEditorProps {
  properties: CustomProperty[]
  onChange: (props: CustomProperty[]) => void
  disabled?: boolean
}

function emptyRow(): CustomProperty {
  return { id: generateId(), property: '', value: '', description: '' }
}

export function CustomPropertiesEditor({
  properties,
  onChange,
  disabled = false,
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
          <div key={row.id} className="border border-[#e4e4f0] rounded-lg p-3 space-y-2 relative">
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(properties.filter(p => p.id !== row.id))}
                className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] rounded"
                aria-label="Remove custom property"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-2 pr-8">
              <div>
                <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Property</label>
                <Input
                  value={row.property}
                  onChange={e => update(row.id, { property: e.target.value })}
                  placeholder="dataSteward"
                  disabled={disabled}
                  className={cn('h-8 text-xs font-mono', nameError && 'border-[#c12c11]')}
                />
                {nameError ? <p className="text-[10px] text-[#c12c11] mt-0.5">{nameError}</p> : null}
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Value</label>
                <Input
                  value={row.value}
                  onChange={e => update(row.id, { value: e.target.value })}
                  placeholder="john.doe@example.com"
                  disabled={disabled}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Description (optional)</label>
              <Textarea
                value={row.description ?? ''}
                onChange={e => update(row.id, { description: e.target.value })}
                placeholder="Owner responsible for data quality."
                rows={2}
                disabled={disabled}
                className="text-xs min-h-[56px] resize-y"
              />
            </div>
          </div>
        )
      })}

      {!disabled && (
        <button
          type="button"
          onClick={() => onChange([...properties, emptyRow()])}
          className={governanceTableFooterActionClass}
        >
          <Plus className="h-3.5 w-3.5" />
          Add custom property
        </button>
      )}
    </div>
  )
}
