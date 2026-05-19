import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PropertyItems } from '@/types/odcs'
import { Input } from '@/components/ui/input'

interface PropertyItemsEditorProps {
  items: PropertyItems | undefined
  onChange: (items: PropertyItems | undefined) => void
  disabled?: boolean
}

export function PropertyItemsEditor({ items, onChange, disabled }: PropertyItemsEditorProps) {
  const logicalType = items?.logicalType ?? 'string'

  return (
    <div className="space-y-3 border border-[#e4e4f0] rounded-lg p-3 bg-[#fbfbff]">
      <p className="text-[10px] text-[#656574] leading-snug">
        Array items (P1) — describe element type when logical type is array.
      </p>
      <div>
        <Label className="text-xs text-[#33333d] mb-1 block">Items logical type</Label>
        <Select
          value={logicalType}
          onValueChange={v => {
            if (!v) return
            if (v === 'string') {
              onChange({ logicalType: 'string' })
            } else {
              onChange({
                logicalType: 'object',
                properties: items?.properties ?? [],
              })
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="string" className="text-xs">string</SelectItem>
            <SelectItem value="object" className="text-xs">object</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logicalType === 'object' && (
        <div>
          <Label className="text-xs text-[#33333d] mb-1 block">Nested property names (comma-separated)</Label>
          <Input
            value={(items?.properties ?? []).map(p => p.physicalName).filter(Boolean).join(', ')}
            onChange={e => {
              const names = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              onChange({
                logicalType: 'object',
                properties: names.map(name => ({
                  id: `item_${name}`,
                  physicalName: name,
                  logicalName: name,
                  physicalType: 'VARCHAR',
                  logicalType: 'string' as const,
                  required: false,
                  isPrimaryKey: false,
                  isPII: false,
                  isUnique: false,
                  description: '',
                  examples: [],
                  qualityRule: '',
                  isUnknownType: false,
                })),
              })
            }}
            placeholder="field_a, field_b"
            disabled={disabled}
            className="h-8 text-xs font-mono"
          />
          <p className="text-[10px] text-[#656574] mt-1">Minimal nested properties for export (P1 object items).</p>
        </div>
      )}
    </div>
  )
}
