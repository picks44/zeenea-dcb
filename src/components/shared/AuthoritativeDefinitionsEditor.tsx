import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AuthoritativeDefinition } from '@/types/odcsShared'
import { AUTH_DEF_TYPE_OPTIONS } from '@/types/odcsShared'
import { getAuthoritativeLinkFieldErrors } from '@/lib/odcsSharedMappers'
import { generateId, cn } from '@/lib/utils'
import { AUTH_LINKS_HELPER } from '@/lib/uxCopy'
import { governanceTableFooterActionClass } from '@/components/shared/GovernanceSectionHeader'
import {
  authoritativeLinkFieldLabelClass,
  authoritativeLinkInputClass,
  authoritativeLinkListShellClass,
  authoritativeLinkRemoveButtonClass,
  authoritativeLinkRowClass,
  authoritativeLinkRowCompactClass,
  authoritativeLinkSelectTriggerClass,
  authoritativeLinkTextareaClass,
} from '@/components/shared/authoritativeLinkUx'

interface AuthoritativeDefinitionsEditorProps {
  definitions: AuthoritativeDefinition[]
  onChange: (defs: AuthoritativeDefinition[]) => void
  disabled?: boolean
  /** Tighter spacing for laptop / docCompact metadata surfaces */
  compact?: boolean
  /** When true, show inline errors on partial rows (URL + type required). */
  showFieldErrors?: boolean
}

function emptyRow(): AuthoritativeDefinition {
  return { id: generateId(), url: '', type: '', description: '' }
}

function AuthoritativeLinkEditRow({
  row,
  compact,
  disabled,
  canRemove,
  showFieldErrors,
  onUpdate,
  onRemove,
}: {
  row: AuthoritativeDefinition
  compact?: boolean
  disabled?: boolean
  canRemove: boolean
  showFieldErrors?: boolean
  onUpdate: (patch: Partial<AuthoritativeDefinition>) => void
  onRemove: () => void
}) {
  const fieldErrors = showFieldErrors ? getAuthoritativeLinkFieldErrors(row) : {}

  return (
    <div className={cn(compact ? authoritativeLinkRowCompactClass : authoritativeLinkRowClass, !disabled && canRemove && 'pr-9')}>
      {!disabled && canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={authoritativeLinkRemoveButtonClass}
          aria-label="Remove authoritative link"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={cn('space-y-2', compact && 'space-y-1.5')}>
        <div className="grid grid-cols-[1fr_128px] gap-2">
          <div>
            <label className={authoritativeLinkFieldLabelClass}>URL</label>
            <Input
              value={row.url}
              onChange={e => onUpdate({ url: e.target.value })}
              placeholder="https://..."
              disabled={disabled}
              className={cn(authoritativeLinkInputClass, fieldErrors.url && 'border-[#c12c11]')}
              aria-invalid={Boolean(fieldErrors.url)}
            />
            {fieldErrors.url ? (
              <p className="text-[10px] text-[#c12c11] mt-0.5">{fieldErrors.url}</p>
            ) : null}
          </div>
          <div>
            <label className={authoritativeLinkFieldLabelClass}>Type</label>
            <Select
              value={row.type || undefined}
              onValueChange={v => v && onUpdate({ type: v })}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(authoritativeLinkSelectTriggerClass, fieldErrors.type && 'border-[#c12c11]')}
                aria-invalid={Boolean(fieldErrors.type)}
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {AUTH_DEF_TYPE_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.type ? (
              <p className="text-[10px] text-[#c12c11] mt-0.5">{fieldErrors.type}</p>
            ) : null}
          </div>
        </div>
        <div>
          <label className={authoritativeLinkFieldLabelClass}>Description (optional)</label>
          <Textarea
            value={row.description ?? ''}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="e.g. Customer ownership reference"
            rows={2}
            disabled={disabled}
            className={authoritativeLinkTextareaClass(compact)}
          />
        </div>
      </div>
    </div>
  )
}

export function AuthoritativeDefinitionsEditor({
  definitions,
  onChange,
  disabled = false,
  compact = false,
  showFieldErrors = false,
}: AuthoritativeDefinitionsEditorProps) {
  const update = (id: string, patch: Partial<AuthoritativeDefinition>) => {
    onChange(definitions.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  const add = () => onChange([...definitions, emptyRow()])

  const remove = (id: string) => onChange(definitions.filter(r => r.id !== id))

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <p className="text-[10px] text-[#656574] leading-snug">{AUTH_LINKS_HELPER}</p>

      {definitions.length > 0 ? (
        <div className={authoritativeLinkListShellClass}>
          {definitions.map(row => (
            <AuthoritativeLinkEditRow
              key={row.id}
              row={row}
              compact={compact}
              disabled={disabled}
              canRemove={!disabled}
              showFieldErrors={showFieldErrors}
              onUpdate={patch => update(row.id, patch)}
              onRemove={() => remove(row.id)}
            />
          ))}
        </div>
      ) : null}

      {!disabled && (
        <button type="button" onClick={add} className={governanceTableFooterActionClass}>
          <Plus className="h-3.5 w-3.5" />
          Add link
        </button>
      )}
    </div>
  )
}
