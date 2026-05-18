import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { QualityRule } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { QUALITY_RULES_HELPER } from '@/lib/uxCopy'
import { governanceTableFooterActionClass } from '@/components/shared/GovernanceSectionHeader'
import {
  qualityRuleFieldLabelClass,
  qualityRuleListShellClass,
  qualityRuleNameInputClass,
  qualityRuleRemoveButtonClass,
  qualityRuleRowClass,
  qualityRuleRowCompactClass,
  qualityRuleTextareaClass,
} from '@/components/shared/qualityRuleUx'

const MAX_RULES = 3
const DEFAULT_HELPER = QUALITY_RULES_HELPER

interface QualityRulesEditorProps {
  rules: QualityRule[]
  onChange: (rules: QualityRule[]) => void
  disabled?: boolean
  helperText?: string
  /** Tighter spacing for laptop / docCompact metadata surfaces */
  compact?: boolean
}

function emptyRule(): QualityRule {
  return { id: generateId(), type: 'text', description: '' }
}

function QualityRuleEditRow({
  rule,
  compact,
  disabled,
  onUpdate,
  onRemove,
}: {
  rule: QualityRule
  compact?: boolean
  disabled?: boolean
  onUpdate: (patch: Partial<QualityRule>) => void
  onRemove: () => void
}) {
  return (
    <div className={cn(compact ? qualityRuleRowCompactClass : qualityRuleRowClass, !disabled && 'pr-9')}>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className={qualityRuleRemoveButtonClass}
          aria-label="Remove quality rule"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={cn('space-y-2', compact && 'space-y-1.5')}>
        <div>
          <label className={qualityRuleFieldLabelClass}>Rule name (optional)</label>
          <Input
            value={rule.name ?? ''}
            onChange={e => onUpdate({ name: e.target.value })}
            placeholder="e.g. Freshness, Completeness"
            disabled={disabled}
            className={qualityRuleNameInputClass}
          />
        </div>
        <div>
          <label className={qualityRuleFieldLabelClass}>Rule description</label>
          <Textarea
            value={rule.description}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="e.g. Must not be null"
            rows={2}
            disabled={disabled}
            className={qualityRuleTextareaClass(compact)}
          />
        </div>
      </div>
    </div>
  )
}

export function QualityRulesEditor({
  rules,
  onChange,
  disabled = false,
  helperText = DEFAULT_HELPER,
  compact = false,
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
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <p className="text-[10px] text-[#656574] leading-snug">{helperText}</p>

      {rules.length > 0 ? (
        <div className={qualityRuleListShellClass}>
          {rules.map(rule => (
            <QualityRuleEditRow
              key={rule.id}
              rule={rule}
              compact={compact}
              disabled={disabled}
              onUpdate={patch => update(rule.id, patch)}
              onRemove={() => remove(rule.id)}
            />
          ))}
        </div>
      ) : null}

      {!disabled && rules.length < MAX_RULES && (
        <button type="button" onClick={add} className={governanceTableFooterActionClass}>
          <Plus className="h-3.5 w-3.5" />
          Add quality rule
        </button>
      )}
    </div>
  )
}
