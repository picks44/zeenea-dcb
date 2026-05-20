import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ColumnForeignKey, SchemaTable } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { FIELD_FK_HELPER, FIELD_FK_INTRO } from '@/lib/uxCopy'
import {
  isColumnForeignKeyComplete,
  isColumnForeignKeyPartial,
} from '@/lib/relationshipExport'
import { isForeignKeyTargetMissing } from '@/lib/schemaRelationshipRefs'
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
  const referencedTables = allTables.filter(t => t.physicalName.trim().length > 0)
  const targetTable = allTables.find(t => t.physicalName === fk.toTable)
  const tableMissing = Boolean(fk.toTable?.trim()) && !targetTable
  const columnMissing = Boolean(
    fk.toTable?.trim()
    && fk.toColumn?.trim()
    && targetTable
    && !targetTable.columns.some(c => c.physicalName === fk.toColumn),
  )
  const staleTarget = isForeignKeyTargetMissing(fk, allTables)
  const partial = isColumnForeignKeyPartial(fk)
  const complete = isColumnForeignKeyComplete(fk)
  const showErrors = showFieldErrors && partial
  const tableSelectValue = targetTable ? fk.toTable : undefined
  const columnSelectValue =
    targetTable && targetTable.columns.some(c => c.physicalName === fk.toColumn)
      ? fk.toColumn
      : undefined

  const update = (patch: Partial<ColumnForeignKey>) => {
    const next = { ...fk, ...patch }
    if (!next.toTable?.trim() && !next.toColumn?.trim()) {
      onChange(undefined)
    } else {
      onChange(next)
    }
  }

  const clearForeignKey = () => onChange(undefined)

  const sourceField = sourceColumnName ?? 'field'
  const sourceLine = `${sourceTableName}.${sourceField}`
  const targetLine = complete && !staleTarget ? `${fk.toTable}.${fk.toColumn}` : ''

  if (disabled && complete && !staleTarget) {
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

      {staleTarget && (
        <div className="rounded border border-[#f0e0c8] bg-[#fffbf5] px-2 py-1.5 flex items-start justify-between gap-2">
          <p className="text-[10px] text-[#8a5c00] leading-snug">
            Referenced target
            {' '}
            <span className="font-mono">
              {fk.toTable}
              {fk.toColumn ? `.${fk.toColumn}` : ''}
            </span>
            {' '}
            is missing or was renamed. Select a new target or clear this foreign key.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] shrink-0 text-neutral-500"
            onClick={clearForeignKey}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#656574] mb-0.5 block">Referenced table</label>
          <Select
            value={tableSelectValue}
            onValueChange={v => {
              if (v === null || v === undefined) {
                update({ toTable: '', toColumn: '' })
                return
              }
              update({ toTable: v, toColumn: '' })
            }}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                'h-8 text-xs',
                (showErrors && !fk.toTable?.trim()) || tableMissing ? 'border-[#c12c11]' : undefined,
              )}
            >
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {referencedTables.map(t => (
                <SelectItem key={t.id} value={t.physicalName} className="text-xs">
                  {t.physicalName}
                  {t.physicalName === sourceTableName ? ' (this table)' : ''}
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
            value={columnSelectValue}
            onValueChange={v => {
              if (v === null || v === undefined) {
                update({ toColumn: '' })
                return
              }
              update({ toColumn: v })
            }}
            disabled={disabled || !fk.toTable?.trim()}
          >
            <SelectTrigger
              className={cn(
                'h-8 text-xs',
                (showErrors && !fk.toColumn?.trim()) || columnMissing ? 'border-[#c12c11]' : undefined,
              )}
            >
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {(targetTable?.columns ?? []).map(c => (
                <SelectItem
                  key={c.id}
                  value={c.physicalName}
                  className="text-xs"
                  disabled={Boolean(
                    sourceTableName === fk.toTable
                    && sourceColumnName
                    && c.physicalName === sourceColumnName,
                  )}
                >
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

      {complete && !staleTarget ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] text-neutral-500 px-0"
          onClick={clearForeignKey}
        >
          Clear foreign key
        </Button>
      ) : null}

      {partial && !showFieldErrors ? (
        <p className="text-[10px] text-[#d27b00] leading-snug">{FIELD_FK_HELPER}</p>
      ) : null}

      {complete && !staleTarget ? (
        <RelationshipPreviewBlock
          sourceLine={sourceLine}
          targetLine={targetLine}
          compact={compact}
        />
      ) : null}
    </div>
  )
}
