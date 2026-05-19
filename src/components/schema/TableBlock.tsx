import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle, Pencil, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ColumnDefinition, LogicalType, SchemaTable, TableRelationship, RelationshipType } from '@/types/odcs'
import { cn, generateId } from '@/lib/utils'
import { LOGICAL_TYPES, DB_TYPES_BY_LOGICAL, typeConfig, makeColumn } from './constants'
import { TypePicker } from './TypePicker'
import { FlagBadge } from './FlagBadge'
import { ColumnAdvancedDialog } from './ColumnAdvancedDialog'
import { TableAdvancedDialog } from './TableAdvancedDialog'
import {
  FIELD_PROPERTIES_TITLE,
  RELATIONSHIP_COMPOSITE_HELPER,
  TABLE_PROPERTIES_TITLE,
  TABLE_RELATIONSHIPS_EMPTY,
  TABLE_RELATIONSHIPS_INTRO,
} from '@/lib/uxCopy'
import { countTableRelationships, formatRelationshipHeaderSummary } from '@/lib/schemaRelationshipUx'
import { hasFieldMetadata, hasTableMetadata, schemaMetadataButtonClass } from '@/lib/schemaMetadataPresence'
import { ColumnFkIndicator } from '@/components/schema/ColumnFkIndicator'
import { TableRelationshipRow } from '@/components/schema/TableRelationshipRow'
import { RelationshipHeaderSummaryBadge } from '@/components/schema/RelationshipHeaderSummary'
import { useRegisterSchemaTable } from '@/components/schema/SchemaNavigationContext'
import { SchemaColumnReadinessAnchor } from '@/components/readiness/SchemaColumnReadinessAnchor'

function deriveLogicalName(physicalName: string): string {
  return physicalName
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase())
}

const REL_OPTIONS: {
  value: RelationshipType
  notation: string
  label: (to: string) => string
  desc: string
}[] = [
  {
    value: 'composite_foreign_key',
    notation: 'FK*',
    label: to => `Composite FK to ${to}`,
    desc: 'Two or more columns as one foreign key',
  },
  {
    value: 'many_to_many',
    notation: 'N ↔ N',
    label: to => `Connected to many ${to}`,
    desc: 'Junction or bridge table pattern',
  },
]

function toggleOrderedColumn(columns: string[], col: string): string[] {
  const i = columns.indexOf(col)
  if (i >= 0) return columns.filter((_, idx) => idx !== i)
  return [...columns, col]
}

interface TableBlockProps {
  table: SchemaTable
  tableIndex: number
  allTables: SchemaTable[]
  isLocked: boolean
  docCompact?: boolean
  onTableChange: (i: number, t: SchemaTable) => void
  onDeleteTable: (i: number) => void
}

export function TableBlock({
  table,
  tableIndex,
  allTables,
  isLocked,
  docCompact,
  onTableChange,
  onDeleteTable,
}: TableBlockProps) {
  const denseReadOnly = isLocked && docCompact
  const [collapsed, setCollapsed] = useState(false)
  const [editingTableName, setEditingTableName] = useState(false)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editingLogicalId, setEditingLogicalId] = useState<string | null>(null)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [advancedColId, setAdvancedColId] = useState<string | null>(null)
  const [tableAdvancedOpen, setTableAdvancedOpen] = useState(false)
  const [editingRel, setEditingRel] = useState<{
    id: string | null
    toTable: string
    type: RelationshipType
    fromColumn: string
    toColumn: string
    fromColumns: string[]
    toColumns: string[]
  } | null>(null)

  const updateCol = (id: string, patch: Partial<ColumnDefinition>) =>
    onTableChange(tableIndex, { ...table, columns: table.columns.map(c => c.id === id ? { ...c, ...patch } : c) })

  const deleteCol = (id: string) =>
    onTableChange(tableIndex, { ...table, columns: table.columns.filter(c => c.id !== id) })

  const addCol = (logicalType: LogicalType = 'string') => {
    onTableChange(tableIndex, { ...table, columns: [...table.columns, makeColumn(logicalType)] })
    setShowTypePicker(false)
  }

  const rels = table.relationships ?? []
  const relCounts = countTableRelationships(table)
  const relHeaderSummary = formatRelationshipHeaderSummary(relCounts)
  const tableHasMetadata = hasTableMetadata(table)
  const otherTables = allTables.filter(t => t.physicalName !== table.physicalName)
  const { setTableRoot, registerColumn } = useRegisterSchemaTable(
    table.physicalName,
    () => setCollapsed(false),
  )

  const saveRel = () => {
    if (!editingRel?.toTable || !editingRel.type) return
    const rel: TableRelationship = {
      id: editingRel.id ?? generateId(),
      toTable: editingRel.toTable,
      type: editingRel.type,
    }
    if (editingRel.type === 'composite_foreign_key') {
      rel.fromColumns = editingRel.fromColumns
      rel.toColumns = editingRel.toColumns
    } else if (editingRel.fromColumn && editingRel.toColumn) {
      rel.fromColumn = editingRel.fromColumn
      rel.toColumn = editingRel.toColumn
    }
    const newRels = rels.find(r => r.id === rel.id)
      ? rels.map(r => r.id === rel.id ? rel : r)
      : [...rels, rel]
    onTableChange(tableIndex, { ...table, relationships: newRels })
    setEditingRel(null)
  }

  const removeRel = (id: string) =>
    onTableChange(tableIndex, { ...table, relationships: rels.filter(r => r.id !== id) })

  const unknownCount = table.columns.filter(c => c.isUnknownType).length
  const piiCount = table.columns.filter(c => c.isPII).length
  const showRelSection = !collapsed && (rels.length > 0 || (!isLocked && otherTables.length > 0))

  return (
    <div
      ref={setTableRoot}
      data-schema-table={table.physicalName}
      className="bg-white rounded-xl border border-neutral-200 transition-shadow hover:shadow-sm"
    >

      {/* Table header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-25 border-b border-neutral-100 rounded-t-xl">
        <button onClick={() => setCollapsed(c => !c)} className="text-neutral-400 hover:text-neutral-600 flex-shrink-0 transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isLocked || !editingTableName ? (
          <div className="flex items-center gap-1.5 group/tname">
            <span className="text-sm font-semibold text-neutral-700">{table.physicalName}</span>
            {!isLocked && (
              <button
                onClick={() => setEditingTableName(true)}
                className="opacity-0 group-hover/tname:opacity-100 text-neutral-300 hover:text-blue-700 transition-opacity flex-shrink-0"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <Input
            autoFocus
            value={table.physicalName}
            onChange={e => onTableChange(tableIndex, { ...table, physicalName: e.target.value })}
            onBlur={() => setEditingTableName(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTableName(false) }}
            placeholder="table_name"
            className="h-7 text-sm font-semibold w-44 flex-shrink-0"
          />
        )}
        <span className="text-[11px] text-neutral-400">{table.columns.length} field{table.columns.length !== 1 ? 's' : ''}</span>
        {relHeaderSummary && <RelationshipHeaderSummaryBadge summary={relHeaderSummary} />}
        {piiCount > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-red-25 text-red-700 border-red-100 flex-shrink-0">
            {piiCount} PII
          </span>
        )}
        {unknownCount > 0 && (
          <span className="text-[10px] text-orange-700 flex items-center gap-0.5 flex-shrink-0">
            <AlertTriangle className="h-3 w-3" />{unknownCount} unknown
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setTableAdvancedOpen(true)}
          className={schemaMetadataButtonClass(tableHasMetadata)}
          title={TABLE_PROPERTIES_TITLE}
          aria-label="Table properties"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
        {!isLocked && (
          <Select value={table.tableType || 'table'} onValueChange={v => onTableChange(tableIndex, { ...table, tableType: v as 'table' | 'view' })}>
            <SelectTrigger className="h-6 text-xs w-20 flex-shrink-0 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="table" className="text-xs">Table</SelectItem>
              <SelectItem value="view" className="text-xs">View</SelectItem>
            </SelectContent>
          </Select>
        )}
        {!isLocked && (
          <button onClick={() => onDeleteTable(tableIndex)} className="h-6 w-6 flex items-center justify-center text-neutral-300 hover:text-red-700 hover:bg-red-25 rounded transition-colors flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Table description */}
      {!collapsed && (
        <div className="px-10 py-1.5 bg-neutral-25/60 border-b border-neutral-100">
          {isLocked
            ? (table.description ? <p className="text-xs text-neutral-500 italic">{table.description}</p> : null)
            : <Input value={table.description} onChange={e => onTableChange(tableIndex, { ...table, description: e.target.value })} placeholder="What does this table contain? (optional)" className="h-7 text-xs w-full text-neutral-600" />
          }
        </div>
      )}

      {/* Fields */}
      {!collapsed && (
        <>
          <div className="overflow-x-auto min-w-0">
          <div className="min-w-[640px]">
          <div className={cn(
            'flex items-center px-4 border-b border-neutral-200 bg-neutral-25/50',
            denseReadOnly ? 'py-1' : 'py-1.5',
          )}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 w-52 flex-shrink-0">Field</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 w-32 flex-shrink-0">Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 w-32 flex-shrink-0">DB Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 w-44 flex-shrink-0">Rules</span>
            <div className="flex-1" />
            {!isLocked && <div className="w-6 flex-shrink-0 ml-2" />}
            {!isLocked && <div className="w-6 flex-shrink-0 ml-2" />}
          </div>

          <div className="divide-y divide-neutral-100">
            {table.columns.length === 0 && (
              <div className="px-4 py-6 text-center text-neutral-400 text-xs italic">
                No fields yet — click "+ Add field" below
              </div>
            )}
            {table.columns.map((col, colIndex) => {
              const tc = typeConfig(col.logicalType)
              const Icon = tc.icon
              const compatibleDbTypes = DB_TYPES_BY_LOGICAL[col.logicalType] ?? ['VARCHAR']
              const hasMetadata = hasFieldMetadata(col)
              return (
                <SchemaColumnReadinessAnchor
                  key={col.id}
                  tableIndex={tableIndex}
                  columnIndex={colIndex}
                  isMissing={!col.description.trim()}
                  registerColumn={registerColumn}
                  columnName={col.physicalName}
                  className={cn(
                    'flex items-start px-4 transition-colors group rounded-md',
                    denseReadOnly ? 'py-2' : 'py-2 hover:bg-neutral-50/50',
                  )}
                >
                  <div className="w-52 flex-shrink-0 pr-3 min-w-0">
                    {isLocked ? (
                      <div>
                        <span className={cn('font-semibold text-neutral-700', denseReadOnly ? 'text-[11px]' : 'text-xs')}>{col.physicalName}</span>
                        <div className={cn(
                          'truncate',
                          denseReadOnly ? 'text-[9px] leading-tight text-neutral-300 mt-0' : 'text-[10px] text-neutral-400 mt-0.5',
                        )}>{col.logicalName || deriveLogicalName(col.physicalName)}</div>
                        <ColumnFkIndicator foreignKey={col.foreignKey} compact={denseReadOnly} />
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <Input value={col.physicalName} onChange={e => updateCol(col.id, { physicalName: e.target.value })} placeholder="col_name" className="h-7 text-xs font-semibold w-full" />
                        {editingLogicalId === col.id ? (
                          <Input autoFocus value={col.logicalName !== '' ? col.logicalName : deriveLogicalName(col.physicalName)} onChange={e => updateCol(col.id, { logicalName: e.target.value })} onBlur={() => setEditingLogicalId(null)} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingLogicalId(null) }} placeholder="Display name" className="h-5 text-[10px] w-full" />
                        ) : (
                          <div className="flex items-center gap-1 group/label min-w-0">
                            <span className={cn('text-[10px] leading-tight truncate', col.logicalName ? 'text-neutral-500' : 'text-neutral-300 italic')}>
                              {col.logicalName || deriveLogicalName(col.physicalName) || 'Display name'}
                            </span>
                            <button onClick={() => setEditingLogicalId(col.id)} className="opacity-0 group-hover/label:opacity-100 text-neutral-300 hover:text-blue-700 transition-opacity flex-shrink-0">
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                        <ColumnFkIndicator foreignKey={col.foreignKey} />
                      </div>
                    )}
                  </div>

                  <div className="w-32 flex-shrink-0 pr-3">
                    {isLocked ? (
                      <span className={cn(
                        'inline-flex items-center gap-0.5 font-semibold rounded border',
                        denseReadOnly ? 'text-[10px] px-1 py-0' : 'text-[10px] px-2 py-0.5',
                        tc.color,
                      )}><Icon className={denseReadOnly ? 'h-2 w-2' : 'h-2.5 w-2.5'} />{tc.pmLabel}</span>
                    ) : editingType === col.id ? (
                      <Select value={col.logicalType} onValueChange={v => { const firstDb = DB_TYPES_BY_LOGICAL[v as LogicalType]?.[0] ?? 'VARCHAR'; updateCol(col.id, { logicalType: v as LogicalType, isUnknownType: false, physicalType: firstDb }); setEditingType(null) }} open onOpenChange={open => { if (!open) setEditingType(null) }}>
                        <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                        <SelectContent className="w-64">
                          {LOGICAL_TYPES.map(opt => { const OptIcon = opt.icon; return (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              <div className="flex items-center gap-2.5">
                                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border', opt.color)}><OptIcon className="h-2.5 w-2.5" />{opt.pmLabel}</span>
                                <span className="text-neutral-400 text-[10px]">{opt.hint}</span>
                              </div>
                            </SelectItem>
                          )})}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button onClick={() => setEditingType(col.id)} title={`${tc.techLabel} — click to change`} className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border transition-all hover:shadow-sm', tc.color, col.isUnknownType && 'ring-1 ring-red-100')}>
                        <Icon className="h-2.5 w-2.5" />{tc.pmLabel}{col.isUnknownType && <AlertTriangle className="h-2.5 w-2.5 ml-0.5" />}
                      </button>
                    )}
                  </div>

                  <div className="w-32 flex-shrink-0 pr-3">
                    {isLocked ? (
                      <span className={cn(
                        'font-mono text-neutral-500 bg-neutral-50 rounded',
                        denseReadOnly ? 'text-[10px] px-1 py-0' : 'text-[11px] px-1.5 py-0.5',
                      )}>{col.physicalType}</span>
                    ) : (
                      <Select value={col.physicalType} onValueChange={v => v !== null && updateCol(col.id, { physicalType: v })}>
                        <SelectTrigger className="h-7 text-[11px] font-mono w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{compatibleDbTypes.map(t => <SelectItem key={t} value={t} className="text-[11px] font-mono">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex items-start w-44 flex-shrink-0">
                    <FlagBadge shape="left"  flag="PK"  active={col.isPrimaryKey} onClick={() => updateCol(col.id, { isPrimaryKey: !col.isPrimaryKey })} disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="mid"   flag="REQ" active={col.required}     onClick={() => updateCol(col.id, { required: !col.required })}         disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="mid"   flag="PII" active={col.isPII}        onClick={() => updateCol(col.id, { isPII: !col.isPII })}               disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="right" flag="UQ"  active={col.isUnique}     onClick={() => updateCol(col.id, { isUnique: !col.isUnique })}         disabled={isLocked} compact={denseReadOnly} />
                  </div>

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={() => setAdvancedColId(col.id)}
                    title={FIELD_PROPERTIES_TITLE}
                    aria-label="Field properties"
                    className={schemaMetadataButtonClass(hasMetadata, {
                      inFieldRow: true,
                      className: 'ml-2 relative',
                    })}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {!isLocked && (
                    <button onClick={() => deleteCol(col.id)} className="h-6 w-6 ml-2 rounded flex items-center justify-center text-neutral-200 group-hover:text-neutral-400 hover:!text-red-700 hover:bg-red-25 transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </SchemaColumnReadinessAnchor>
              )
            })}
          </div>
          </div>
          </div>

          {!isLocked && (
            <div className={cn('px-4 py-2.5 border-t border-neutral-100 bg-neutral-25/40 relative', !showRelSection && 'rounded-b-xl')}>
              <button onClick={() => setShowTypePicker(v => !v)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-blue-700 font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add field
              </button>
              {showTypePicker && <TypePicker onSelect={type => addCol(type)} onClose={() => setShowTypePicker(false)} />}
            </div>
          )}
        </>
      )}

      {/* Table relationships */}
      {showRelSection && (
        <div className="border-t border-neutral-100 bg-neutral-50/40 px-4 py-3 rounded-b-xl">
          <p className="text-xs font-semibold text-neutral-600 mb-1">Table relationships</p>
          <p className="text-[10px] text-neutral-400 mb-2.5 leading-snug">
            {TABLE_RELATIONSHIPS_INTRO}
          </p>

          {rels.length > 0 ? (
            <div className="space-y-2.5 mb-3">
              {rels.map(rel => (
                <TableRelationshipRow
                  key={rel.id}
                  rel={rel}
                  sourceTable={table.physicalName}
                  compact={denseReadOnly}
                  onRemove={isLocked ? undefined : () => removeRel(rel.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-neutral-300 mb-2.5">{TABLE_RELATIONSHIPS_EMPTY}</p>
          )}

          {/* Add form */}
          {!isLocked && (
            editingRel ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-4">

                {/* Step 1 — target table */}
                <p className="text-xs font-medium text-neutral-500 mb-2">Link to which table?</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {otherTables.map(t => (
                    <button
                      key={t.physicalName}
                      onClick={() => setEditingRel(r => r ? {
                        ...r,
                        toTable: t.physicalName,
                        fromColumn: '',
                        toColumn: '',
                        fromColumns: [],
                        toColumns: [],
                      } : r)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-xs font-medium transition-all',
                        editingRel.toTable === t.physicalName
                          ? 'bg-blue-700 border-blue-700 text-white'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-blue-200 hover:text-blue-700'
                      )}
                    >
                      {t.physicalName}
                    </button>
                  ))}
                </div>

                {/* Step 2 — relationship type */}
                {editingRel.toTable && (
                  <>
                    <p className="text-xs font-medium text-neutral-500 mb-2">What's the relationship?</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {REL_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setEditingRel(r => r ? { ...r, type: opt.value } : r)}
                          className={cn(
                            'flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all',
                            editingRel.type === opt.value
                              ? 'bg-blue-25 border-blue-200'
                              : 'bg-white border-neutral-100 hover:border-neutral-200'
                          )}
                        >
                          <span className={cn(
                            'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border mt-0.5 flex-shrink-0 tabular-nums',
                            editingRel.type === opt.value
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-neutral-50 border-neutral-100 text-neutral-400'
                          )}>
                            {opt.notation}
                          </span>
                          <div>
                            <p className={cn('text-[11px] font-semibold leading-tight', editingRel.type === opt.value ? 'text-blue-700' : 'text-neutral-700')}>
                              {opt.label(editingRel.toTable)}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {editingRel.toTable && editingRel.type === 'composite_foreign_key' && table.columns.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <p className="text-[10px] text-orange-700 leading-snug">{RELATIONSHIP_COMPOSITE_HELPER}</p>
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1.5">Source columns ({table.physicalName})</p>
                      <div className="flex flex-wrap gap-1">
                        {table.columns.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setEditingRel(r => r ? {
                              ...r,
                              fromColumns: toggleOrderedColumn(r.fromColumns, c.physicalName),
                            } : r)}
                            className={cn(
                              'px-2 py-0.5 rounded border text-[10px] font-mono transition-colors',
                              editingRel.fromColumns.includes(c.physicalName)
                                ? 'bg-blue-700 border-blue-700 text-white'
                                : 'bg-white border-neutral-200 text-neutral-600',
                            )}
                          >
                            {c.physicalName}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1.5">Referenced columns ({editingRel.toTable})</p>
                      <div className="flex flex-wrap gap-1">
                        {(allTables.find(t => t.physicalName === editingRel.toTable)?.columns ?? []).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setEditingRel(r => r ? {
                              ...r,
                              toColumns: toggleOrderedColumn(r.toColumns, c.physicalName),
                            } : r)}
                            className={cn(
                              'px-2 py-0.5 rounded border text-[10px] font-mono transition-colors',
                              editingRel.toColumns.includes(c.physicalName)
                                ? 'bg-blue-700 border-blue-700 text-white'
                                : 'bg-white border-neutral-200 text-neutral-600',
                            )}
                          >
                            {c.physicalName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {editingRel.toTable && editingRel.type === 'many_to_many' && table.columns.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-500 mb-2">
                      Join columns <span className="text-neutral-300 font-normal">(optional)</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={editingRel.fromColumn} onValueChange={v => v && setEditingRel(r => r ? { ...r, fromColumn: v } : r)}>
                        <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue placeholder={`${table.physicalName}…`} /></SelectTrigger>
                        <SelectContent>{table.columns.map(c => <SelectItem key={c.id} value={c.physicalName} className="text-xs">{c.physicalName}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-[11px] text-neutral-300">→</span>
                      <Select value={editingRel.toColumn} onValueChange={v => v && setEditingRel(r => r ? { ...r, toColumn: v } : r)}>
                        <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue placeholder={`${editingRel.toTable}…`} /></SelectTrigger>
                        <SelectContent>
                          {(allTables.find(t => t.physicalName === editingRel.toTable)?.columns ?? []).map(c => (
                            <SelectItem key={c.id} value={c.physicalName} className="text-xs">{c.physicalName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={saveRel}
                    disabled={
                      !editingRel.toTable
                      || !editingRel.type
                      || (editingRel.type === 'composite_foreign_key'
                        && (editingRel.fromColumns.length < 2
                          || editingRel.toColumns.length < 2
                          || editingRel.fromColumns.length !== editingRel.toColumns.length))
                    }
                    className="h-7 text-xs"
                  >
                    Add relationship
                  </Button>
                  <button onClick={() => setEditingRel(null)} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingRel({
                  id: null,
                  toTable: '',
                  type: 'composite_foreign_key',
                  fromColumn: '',
                  toColumn: '',
                  fromColumns: [],
                  toColumns: [],
                })}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-blue-700 font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add relationship
              </button>
            )
          )}
        </div>
      )}

      <ColumnAdvancedDialog
        column={table.columns.find(c => c.id === advancedColId) ?? null}
        open={advancedColId !== null}
        allTables={allTables}
        sourceTableName={table.physicalName}
        isLocked={isLocked}
        docCompact={docCompact}
        onClose={() => setAdvancedColId(null)}
        onSave={updated => {
          updateCol(updated.id, updated)
          setAdvancedColId(null)
        }}
      />

      <TableAdvancedDialog
        table={table}
        open={tableAdvancedOpen}
        isLocked={isLocked}
        docCompact={docCompact}
        onClose={() => setTableAdvancedOpen(false)}
        onSave={updated => onTableChange(tableIndex, updated)}
      />
    </div>
  )
}
