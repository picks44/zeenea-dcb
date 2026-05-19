import { Plus, Trash2, Sparkles, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QualityRule } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { QUALITY_RULES_HELPER } from '@/lib/uxCopy'
import { QUALITY_DIMENSIONS } from '@/lib/p1Constants'
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
const DEFAULT_HELPER = `${QUALITY_RULES_HELPER} Rules use text format only. Table-level rules require verification before publish.`

interface QualityRulesEditorProps {
  rules: QualityRule[]
  onChange: (rules: QualityRule[]) => void
  disabled?: boolean
  helperText?: string
  compact?: boolean
  /** When true, show AI verify control (table-level quality rules). */
  showAiVerification?: boolean
}

function emptyRule(): QualityRule {
  return { id: generateId(), type: 'text', description: '', aiVerified: false }
}

function QualityRuleEditRow({
  rule,
  compact,
  disabled,
  showAiVerification,
  onUpdate,
  onRemove,
}: {
  rule: QualityRule
  compact?: boolean
  disabled?: boolean
  showAiVerification?: boolean
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
            placeholder="e.g. No nulls in order_id"
            disabled={disabled}
            className={qualityRuleNameInputClass}
          />
        </div>
        <div>
          <label className={qualityRuleFieldLabelClass}>Rule description</label>
          <Textarea
            value={rule.description}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="e.g. There must be no null values in the column."
            rows={2}
            disabled={disabled}
            className={qualityRuleTextareaClass(compact)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={qualityRuleFieldLabelClass}>Dimension</label>
            <Select
              value={rule.dimension ?? ''}
              onValueChange={v => v && onUpdate({ dimension: v as QualityRule['dimension'] })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {QUALITY_DIMENSIONS.map(d => (
                  <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={qualityRuleFieldLabelClass}>Severity (optional)</label>
            <Input
              value={rule.severity ?? ''}
              onChange={e => onUpdate({ severity: e.target.value })}
              placeholder="e.g. high"
              disabled={disabled}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <label className={qualityRuleFieldLabelClass}>Business impact (optional)</label>
          <Input
            value={rule.businessImpact ?? ''}
            onChange={e => onUpdate({ businessImpact: e.target.value })}
            placeholder="Consequences if the rule fails"
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <p className="text-[10px] text-[#656574]">Type: <span className="font-mono">text</span> (supported format)</p>
        {showAiVerification && (
          <div className="flex items-center gap-2">
            {rule.aiVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#047800]">
                <Check className="h-3 w-3" /> AI verified
              </span>
            ) : (
              <button
                type="button"
                disabled={disabled || !rule.description.trim()}
                onClick={() => onUpdate({ aiVerified: true })}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0550dc] hover:underline disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3" />
                Verify with AI (mock)
              </button>
            )}
          </div>
        )}
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
  showAiVerification = false,
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
              showAiVerification={showAiVerification}
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
