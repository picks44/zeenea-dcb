import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AuthoritativeDefinition } from '@/types/odcsShared'
import {
  FUNDAMENTALS_AUTH_DEF_LABELS,
  FUNDAMENTALS_AUTH_DEF_TYPES,
  SHARED_AUTH_DEF_TYPES,
  ZEENEA_AUTH_DEF_TYPE,
} from '@/types/odcsShared'
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
import { ZEENEA_CATALOG } from '@/lib/zeeneaCatalog'

export type AuthoritativeDefinitionsVariant = 'fundamentals' | 'zeenea' | 'shared'

interface AuthoritativeDefinitionsEditorProps {
  definitions: AuthoritativeDefinition[]
  onChange: (defs: AuthoritativeDefinition[]) => void
  disabled?: boolean
  compact?: boolean
  showFieldErrors?: boolean
  variant?: AuthoritativeDefinitionsVariant
}

export function createEmptyAuthoritativeDefinition(
  variant: AuthoritativeDefinitionsVariant,
): AuthoritativeDefinition {
  return {
    id: generateId(),
    url: '',
    type:
      variant === 'zeenea'
        ? ZEENEA_AUTH_DEF_TYPE
        : variant === 'fundamentals'
          ? FUNDAMENTALS_AUTH_DEF_TYPES[0]
          : '',
    description: '',
  }
}

function typeOptions(variant: AuthoritativeDefinitionsVariant): { value: string; label: string }[] {
  if (variant === 'fundamentals') {
    return FUNDAMENTALS_AUTH_DEF_TYPES.map(value => ({
      value,
      label: FUNDAMENTALS_AUTH_DEF_LABELS[value],
    }))
  }
  if (variant === 'zeenea') {
    return [{ value: ZEENEA_AUTH_DEF_TYPE, label: 'Actian (Zeenea)' }]
  }
  return SHARED_AUTH_DEF_TYPES.map(value => ({ value, label: value }))
}

function helperForVariant(variant: AuthoritativeDefinitionsVariant): string {
  if (variant === 'fundamentals') {
    return 'Privacy statement, Terms and Conditions, or License Agreement.'
  }
  if (variant === 'zeenea') {
    return 'Only Zeenea catalog links with type actian. Pick from catalog or paste a validated URL.'
  }
  return AUTH_LINKS_HELPER
}

function AuthoritativeLinkEditRow({
  row,
  compact,
  disabled,
  canRemove,
  showFieldErrors,
  variant,
  onUpdate,
  onRemove,
}: {
  row: AuthoritativeDefinition
  compact?: boolean
  disabled?: boolean
  canRemove: boolean
  showFieldErrors?: boolean
  variant: AuthoritativeDefinitionsVariant
  onUpdate: (patch: Partial<AuthoritativeDefinition>) => void
  onRemove: () => void
}) {
  const fieldErrors = showFieldErrors ? getAuthoritativeLinkFieldErrors(row) : {}
  const options = typeOptions(variant)
  const isZeenea = variant === 'zeenea'

  return (
    <div className={cn(compact ? authoritativeLinkRowCompactClass : authoritativeLinkRowClass, !disabled && canRemove && 'pr-9')}>
      {!disabled && canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={authoritativeLinkRemoveButtonClass}
          aria-label="Remove reference link"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={cn('space-y-2', compact && 'space-y-1.5')}>
        {isZeenea && !disabled && (
          <div>
            <label className={authoritativeLinkFieldLabelClass}>Zeenea catalog</label>
            <Select
              value={ZEENEA_CATALOG.find(i => i.url === row.url)?.id ?? ''}
              onValueChange={v => {
                const item = ZEENEA_CATALOG.find(i => i.id === v)
                if (item) onUpdate({ url: item.url, type: ZEENEA_AUTH_DEF_TYPE })
              }}
            >
              <SelectTrigger className={authoritativeLinkSelectTriggerClass}>
                <SelectValue placeholder="Pick catalog item…" />
              </SelectTrigger>
              <SelectContent>
                {ZEENEA_CATALOG.map(item => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={cn('grid gap-2', isZeenea ? 'grid-cols-1' : 'grid-cols-[1fr_128px]')}>
          <div>
            <label className={authoritativeLinkFieldLabelClass}>URL</label>
            <Input
              value={row.url}
              onChange={e => onUpdate({ url: e.target.value, ...(isZeenea ? { type: ZEENEA_AUTH_DEF_TYPE } : {}) })}
              placeholder={isZeenea ? 'https://catalog.zeenea.example/...' : 'https://...'}
              disabled={disabled}
              className={cn(authoritativeLinkInputClass, fieldErrors.url && 'border-[#c12c11]')}
              aria-invalid={Boolean(fieldErrors.url)}
            />
            {fieldErrors.url ? (
              <p className="text-[10px] text-[#c12c11] mt-0.5">{fieldErrors.url}</p>
            ) : null}
          </div>
          {!isZeenea && (
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
                  {options.map(({ value, label }) => (
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
          )}
          {isZeenea && (
            <p className="text-[10px] text-[#656574]">Type: <span className="font-mono">{ZEENEA_AUTH_DEF_TYPE}</span></p>
          )}
        </div>
        <div>
          <label className={authoritativeLinkFieldLabelClass}>Description (optional)</label>
          <Textarea
            value={row.description ?? ''}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="Optional description"
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
  variant = 'shared',
}: AuthoritativeDefinitionsEditorProps) {
  const update = (id: string, patch: Partial<AuthoritativeDefinition>) => {
    onChange(definitions.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  const add = () => onChange([...definitions, createEmptyAuthoritativeDefinition(variant)])

  const remove = (id: string) => onChange(definitions.filter(r => r.id !== id))

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <p className="text-[10px] text-[#656574] leading-snug">{helperForVariant(variant)}</p>

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
              variant={variant}
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
