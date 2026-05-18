import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle, Pencil, X, SlidersHorizontal } from 'lucide-react'
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
import { isBelongsToRelationshipIncomplete, isExportedRelationshipType } from '@/types/odcsShared'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import { RELATIONSHIP_FK_HELPER, RELATIONSHIPS_SECTION_INTRO } from '@/lib/uxCopy'

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
  { value: 'belongs_to',   notation: 'N → 1', label: to => `Belongs to one ${to}`,    desc: 'Foreign key on this table'           },
  { value: 'many_to_many', notation: 'N ↔ N', label: to => `Connected to many ${to}`, desc: 'Junction or bridge table pattern'    },
]

const LEGACY_REL_LABELS: Partial<Record<RelationshipType, { notation: string; label: (to: string) => string }>> = {
  has_many: { notation: '1 → N', label: to => `Has many ${to}` },
  has_one: { notation: '1 → 1', label: to => `Has one ${to}` },
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
  const otherTables = allTables.filter(t => t.physicalName !== table.physicalName)

  const saveRel = () => {
    if (!editingRel?.toTable || !editingRel.type) return
    const rel: TableRelationship = {
      id: editingRel.id ?? generateId(),
      toTable: editingRel.toTable,
      type: editingRel.type,
      ...(editingRel.fromColumn && editingRel.toColumn
        ? { fromColumn: editingRel.fromColumn, toColumn: editingRel.toColumn }
        : {}),
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
    <div className="bg-white rounded-xl border border-[#d3d3e5] transition-shadow hover:shadow-sm">

      {/* Table header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fbfbff] border-b border-[#e4e4f0] rounded-t-xl">
        <button onClick={() => setCollapsed(c => !c)} className="text-[#656574] hover:text-[#33333d] flex-shrink-0 transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isLocked || !editingTableName ? (
          <div className="flex items-center gap-1.5 group/tname">
            <span className="text-sm font-semibold text-[#2a2a30]">{table.physicalName}</span>
            {!isLocked && (
              <button
                onClick={() => setEditingTableName(true)}
                className="opacity-0 group-hover/tname:opacity-100 text-[#9898a7] hover:text-[#0550dc] transition-opacity flex-shrink-0"
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
        <span className="text-[11px] text-[#656574]">{table.columns.length} field{table.columns.length !== 1 ? 's' : ''}</span>
        {rels.length > 0 && (
          <span className="text-[11px] text-[#656574]">· {rels.length} relation{rels.length !== 1 ? 's' : ''}</span>
        )}
        {piiCount > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-[#fff2ee] text-[#c12c11] border-rose-100 flex-shrink-0">
            {piiCount} PII
          </span>
        )}
        {unknownCount > 0 && (
          <span className="text-[10px] text-[#d27b00] flex items-center gap-0.5 flex-shrink-0">
            <AlertTriangle className="h-3 w-3" />{unknownCount} unknown
          </span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setTableAdvancedOpen(true)}
          className="h-6 w-6 flex items-center justify-center text-[#9898a7] hover:text-[#0550dc] hover:bg-[#f5f5fa] rounded transition-colors flex-shrink-0"
          title="Metadata: tags, quality, authoritative links"
          aria-label="Metadata: tags, quality, authoritative links"
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
          <button onClick={() => onDeleteTable(tableIndex)} className="h-6 w-6 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded transition-colors flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Table description */}
      {!collapsed && (
        <div className="px-10 py-1.5 bg-[#fbfbff]/60 border-b border-[#e4e4f0]">
          {isLocked
            ? (table.description ? <p className="text-xs text-[#3f3f4a] italic">{table.description}</p> : null)
            : <Input value={table.description} onChange={e => onTableChange(tableIndex, { ...table, description: e.target.value })} placeholder="What does this table contain? (optional)" className="h-7 text-xs w-full text-[#33333d]" />
          }
        </div>
      )}

      {/* Fields */}
      {!collapsed && (
        <>
          <div className="overflow-x-auto min-w-0">
          <div className="min-w-[640px]">
          <div className={cn(
            'flex items-center px-4 border-b border-[#d3d3e5] bg-[#fbfbff]/50',
            denseReadOnly ? 'py-1' : 'py-1.5',
          )}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] w-52 flex-shrink-0">Field</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] w-32 flex-shrink-0">Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] w-32 flex-shrink-0">DB Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] w-44 flex-shrink-0">Rules</span>
            <div className="flex-1" />
            {!isLocked && <div className="w-6 flex-shrink-0 ml-2" />}
            {!isLocked && <div className="w-6 flex-shrink-0 ml-2" />}
          </div>

          <div className="divide-y divide-zinc-100">
            {table.columns.length === 0 && (
              <div className="px-4 py-6 text-center text-[#656574] text-xs italic">
                No fields yet — click "+ Add field" below
              </div>
            )}
            {table.columns.map(col => {
              const tc = typeConfig(col.logicalType)
              const Icon = tc.icon
              const compatibleDbTypes = DB_TYPES_BY_LOGICAL[col.logicalType] ?? ['VARCHAR']
              return (
                <div
                  key={col.id}
                  className={cn(
                    'flex items-center px-4 transition-colors group',
                    denseReadOnly ? 'py-1.5' : 'py-2 hover:bg-[#f5f5fa]/50',
                  )}
                >
                  <div className="w-52 flex-shrink-0 pr-3">
                    {isLocked ? (
                      <div>
                        <span className={cn('font-semibold text-[#2a2a30]', denseReadOnly ? 'text-[11px]' : 'text-xs')}>{col.physicalName}</span>
                        <div className={cn(
                          'truncate',
                          denseReadOnly ? 'text-[9px] leading-tight text-[#9898a7] mt-0' : 'text-[10px] text-[#656574] mt-0.5',
                        )}>{col.logicalName || deriveLogicalName(col.physicalName)}</div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <Input value={col.physicalName} onChange={e => updateCol(col.id, { physicalName: e.target.value })} placeholder="col_name" className="h-7 text-xs font-semibold w-full" />
                        {editingLogicalId === col.id ? (
                          <Input autoFocus value={col.logicalName !== '' ? col.logicalName : deriveLogicalName(col.physicalName)} onChange={e => updateCol(col.id, { logicalName: e.target.value })} onBlur={() => setEditingLogicalId(null)} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingLogicalId(null) }} placeholder="Display name" className="h-5 text-[10px] w-full" />
                        ) : (
                          <div className="flex items-center gap-1 group/label min-w-0">
                            <span className={cn('text-[10px] leading-tight truncate', col.logicalName ? 'text-[#3f3f4a]' : 'text-[#9898a7] italic')}>
                              {col.logicalName || deriveLogicalName(col.physicalName) || 'Display name'}
                            </span>
                            <button onClick={() => setEditingLogicalId(col.id)} className="opacity-0 group-hover/label:opacity-100 text-[#9898a7] hover:text-[#0550dc] transition-opacity flex-shrink-0">
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
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
                                <span className="text-[#656574] text-[10px]">{opt.hint}</span>
                              </div>
                            </SelectItem>
                          )})}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button onClick={() => setEditingType(col.id)} title={`${tc.techLabel} — click to change`} className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border transition-all hover:shadow-sm', tc.color, col.isUnknownType && 'ring-1 ring-rose-400')}>
                        <Icon className="h-2.5 w-2.5" />{tc.pmLabel}{col.isUnknownType && <AlertTriangle className="h-2.5 w-2.5 ml-0.5" />}
                      </button>
                    )}
                  </div>

                  <div className="w-32 flex-shrink-0 pr-3">
                    {isLocked ? (
                      <span className={cn(
                        'font-mono text-[#3f3f4a] bg-[#f5f5fa] rounded',
                        denseReadOnly ? 'text-[10px] px-1 py-0' : 'text-[11px] px-1.5 py-0.5',
                      )}>{col.physicalType}</span>
                    ) : (
                      <Select value={col.physicalType} onValueChange={v => v !== null && updateCol(col.id, { physicalType: v })}>
                        <SelectTrigger className="h-7 text-[11px] font-mono w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{compatibleDbTypes.map(t => <SelectItem key={t} value={t} className="text-[11px] font-mono">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex items-center w-44 flex-shrink-0">
                    <FlagBadge shape="left"  flag="PK"  active={col.isPrimaryKey} onClick={() => updateCol(col.id, { isPrimaryKey: !col.isPrimaryKey })} disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="mid"   flag="REQ" active={col.required}     onClick={() => updateCol(col.id, { required: !col.required })}         disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="mid"   flag="PII" active={col.isPII}        onClick={() => updateCol(col.id, { isPII: !col.isPII })}               disabled={isLocked} compact={denseReadOnly} />
                    <FlagBadge shape="right" flag="UQ"  active={col.isUnique}     onClick={() => updateCol(col.id, { isUnique: !col.isUnique })}         disabled={isLocked} compact={denseReadOnly} />
                  </div>

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={() => setAdvancedColId(col.id)}
                    title="Metadata: description, examples, tags, quality, authoritative links"
                    aria-label="Metadata: description, examples, tags, quality, authoritative links"
                    className={cn(
                      'h-6 w-6 ml-2 rounded flex items-center justify-center transition-all flex-shrink-0 relative',
                      (col.description?.trim() || col.quality?.length || col.qualityRule?.trim())
                        ? 'text-[#0550dc] bg-[#f0f4ff]'
                        : 'text-[#d3d3e5] group-hover:text-[#9898a7] hover:!text-[#0550dc] hover:bg-[#f0f4ff]',
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {!isLocked && (
                    <button onClick={() => deleteCol(col.id)} className="h-6 w-6 ml-2 rounded flex items-center justify-center text-[#d3d3e5] group-hover:text-[#656574] hover:!text-[#c12c11] hover:bg-[#fff2ee] transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          </div>
          </div>

          {!isLocked && (
            <div className={cn('px-4 py-2.5 border-t border-[#e4e4f0] bg-[#fbfbff]/40 relative', !showRelSection && 'rounded-b-xl')}>
              <button onClick={() => setShowTypePicker(v => !v)} className="flex items-center gap-1.5 text-xs text-[#656574] hover:text-[#0550dc] font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add field
              </button>
              {showTypePicker && <TypePicker onSelect={type => addCol(type)} onClose={() => setShowTypePicker(false)} />}
            </div>
          )}
        </>
      )}

      {/* Relationships */}
      {showRelSection && (
        <div className="border-t border-[#e4e4f0] bg-[#fbfbff]/30 px-4 py-3 rounded-b-xl">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9898a7] mb-2.5">Relationships</p>
          <p className="text-[10px] text-[#656574] mb-2 leading-snug">
            {RELATIONSHIPS_SECTION_INTRO}
          </p>

          {/* Existing */}
          {rels.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {rels.map(rel => {
                const exported = isExportedRelationshipType(rel.type)
                const incompleteFk = isBelongsToRelationshipIncomplete(rel)
                const opt = REL_OPTIONS.find(r => r.value === rel.type)
                const legacy = LEGACY_REL_LABELS[rel.type]
                const labelFn = opt?.label ?? legacy?.label ?? (() => rel.type)
                return (
                  <div key={rel.id} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded flex-shrink-0 tabular-nums">
                      {opt?.notation ?? legacy?.notation ?? '?'}
                    </span>
                    <span className="text-[11px] text-neutral-600">
                      {labelFn(rel.toTable)}
                    </span>
                    {(!exported || incompleteFk) && (
                      <WorkflowMetadataPill variant="not-published" />
                    )}
                    {rel.fromColumn && rel.toColumn && (
                      <span className="text-[10px] font-mono text-neutral-300">
                        ({rel.fromColumn} → {rel.toColumn})
                      </span>
                    )}
                    {!isLocked && (
                      <button onClick={() => removeRel(rel.id)} className="ml-auto text-neutral-200 hover:text-red-700 hover:bg-red-25 rounded p-0.5 transition-colors flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                    {incompleteFk && (
                      <p className="text-[10px] text-[#656574] pl-1 leading-snug">
                        {RELATIONSHIP_FK_HELPER}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
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
                      onClick={() => setEditingRel(r => r ? { ...r, toTable: t.physicalName, fromColumn: '', toColumn: '' } : r)}
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

                {/* Step 3 — optional columns */}
                {editingRel.toTable && editingRel.type && table.columns.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-500 mb-2">
                      Join columns
                      {editingRel.type !== 'belongs_to' && (
                        <span className="text-neutral-300 font-normal"> (optional)</span>
                      )}
                    </p>
                    {editingRel.type === 'belongs_to' && (
                      <p className="text-[10px] text-[#d27b00] mb-2 leading-snug">
                        {RELATIONSHIP_FK_HELPER}
                      </p>
                    )}
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
                    disabled={!editingRel.toTable || !editingRel.type}
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
                onClick={() => setEditingRel({ id: null, toTable: '', type: 'belongs_to', fromColumn: '', toColumn: '' })}
                className="flex items-center gap-1.5 text-xs text-[#656574] hover:text-[#0550dc] font-medium transition-colors"
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
        isLocked={isLocked}
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
        onClose={() => setTableAdvancedOpen(false)}
        onSave={updated => onTableChange(tableIndex, updated)}
      />
    </div>
  )
}
