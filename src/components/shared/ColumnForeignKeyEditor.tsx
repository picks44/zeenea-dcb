import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ColumnForeignKey, SchemaTable } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { FIELD_FK_HELPER, FIELD_FK_INTRO } from '@/lib/uxCopy'
import {
  isColumnForeignKeyComplete,
  isColumnForeignKeyPartial,
} from '@/lib/relationshipExport'
import { RelationshipPreviewBlock } from '@/components/shared/RelationshipPreviewBlock'

interface ColumnForeignKeyEditorProps {
  foreignKey: ColumnForeignKey | undefined
  onChange: (fk: ColumnForeignKey | undefined) => void
  sourceTableName: string
  sourceColumnName?: string
  allTables: SchemaTable[]
  disabled?: boolean
  showFieldErrors?: boolean
  compact?: boolean
}

const emptyFk = (): ColumnForeignKey => ({ toTable: '', toColumn: '' })

export function ColumnForeignKeyEditor({
  foreignKey,
  onChange,
  sourceTableName,
  sourceColumnName,
  allTables,
  disabled = false,
  showFieldErrors = false,
  compact = false,
}: ColumnForeignKeyEditorProps) {
  const fk = foreignKey ?? emptyFk()
  const otherTables = allTables.filter(t => t.physicalName !== sourceTableName)
  const targetTable = allTables.find(t => t.physicalName === fk.toTable)
  const partial = isColumnForeignKeyPartial(fk)
  const complete = isColumnForeignKeyComplete(fk)
  const showErrors = showFieldErrors && partial

  const update = (patch: Partial<ColumnForeignKey>) => {
    const next = { ...fk, ...patch }
    if (!next.toTable?.trim() && !next.toColumn?.trim()) {
      onChange(undefined)
    } else {
      onChange(next)
    }
  }

  const sourceField = sourceColumnName ?? 'field'
  const sourceLine = `${sourceTableName}.${sourceField}`
  const targetLine = complete ? `${fk.toTable}.${fk.toColumn}` : ''

  if (disabled && complete) {
    return (
      <RelationshipPreviewBlock
        sourceLine={sourceLine}
        targetLine={targetLine}
        compact={compact}
      />
    )
  }

  if (disabled && !complete) {
    return <p className="text-xs text-[#9898a7] leading-snug">No foreign key configured.</p>
  }

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <p className="text-[10px] text-[#656574] leading-snug">{FIELD_FK_INTRO}</p>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Referenced table</label>
          <Select
            value={fk.toTable || undefined}
            onValueChange={v => v && update({ toTable: v, toColumn: '' })}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn('h-8 text-xs', showErrors && !fk.toTable?.trim() && 'border-[#c12c11]')}
            >
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {otherTables.map(t => (
                <SelectItem key={t.id} value={t.physicalName} className="text-xs">
                  {t.physicalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErrors && !fk.toTable?.trim() ? (
            <p className="text-[10px] text-[#c12c11] mt-0.5">Referenced table is required.</p>
          ) : null}
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Referenced field</label>
          <Select
            value={fk.toColumn || undefined}
            onValueChange={v => v && update({ toColumn: v })}
            disabled={disabled || !fk.toTable}
          >
            <SelectTrigger
              className={cn('h-8 text-xs', showErrors && !fk.toColumn?.trim() && 'border-[#c12c11]')}
            >
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {(targetTable?.columns ?? []).map(c => (
                <SelectItem key={c.id} value={c.physicalName} className="text-xs">
                  {c.physicalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErrors && !fk.toColumn?.trim() ? (
            <p className="text-[10px] text-[#c12c11] mt-0.5">Referenced field is required.</p>
          ) : null}
        </div>
      </div>

      {partial && !showFieldErrors ? (
        <p className="text-[10px] text-[#d27b00] leading-snug">{FIELD_FK_HELPER}</p>
      ) : null}

      {complete ? (
        <RelationshipPreviewBlock
          sourceLine={sourceLine}
          targetLine={targetLine}
          compact={compact}
        />
      ) : null}
    </div>
  )
}
