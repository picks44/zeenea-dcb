import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { QualityRule } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { QUALITY_RULES_HELPER } from '@/lib/uxCopy'

const MAX_RULES = 3
const DEFAULT_HELPER = QUALITY_RULES_HELPER

interface QualityRulesEditorProps {
  rules: QualityRule[]
  onChange: (rules: QualityRule[]) => void
  disabled?: boolean
  helperText?: string
}

function emptyRule(): QualityRule {
  return { id: generateId(), type: 'text', description: '' }
}

export function QualityRulesEditor({
  rules,
  onChange,
  disabled = false,
  helperText = DEFAULT_HELPER,
}: QualityRulesEditorProps) {
  const update = (id: string, patch: Partial<QualityRule>) => {
    onChange(rules.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  const add = () => {
    if (rules.length >= MAX_RULES) return
    onChange([...rules, emptyRule()])
  }

  const remove = (id: string) => onChange(rules.filter(r => r.id !== id))

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#656574]">{helperText}</p>
      {rules.map(rule => (
        <div key={rule.id} className="border border-[#e4e4f0] rounded-lg p-3 space-y-2 bg-[#fbfbff]/50">
          <div>
            <Label className="text-[10px] text-[#656574] mb-0.5 block">Description</Label>
            <Textarea
              value={rule.description}
              onChange={e => update(rule.id, { description: e.target.value })}
              placeholder="e.g. Must not be null"
              rows={2}
              disabled={disabled}
              className="text-xs resize-y"
            />
          </div>
          <Input
            value={rule.name ?? ''}
            onChange={e => update(rule.id, { name: e.target.value })}
            placeholder="Rule name (optional)"
            disabled={disabled}
            className="h-8 text-xs"
          />
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(rule.id)} className="h-7 text-xs text-red-600">
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          )}
        </div>
      ))}
      {!disabled && rules.length < MAX_RULES && (
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add quality rule
        </Button>
      )}
    </div>
  )
}
