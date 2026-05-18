import { useState, useRef, useEffect } from 'react'
import { Plus, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SchemaTable } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { TableBlock } from '@/components/schema/TableBlock'
import { SchemaNavigationProvider } from '@/components/schema/SchemaNavigationContext'
import {
  useReadinessField,
  useSectionGuidanceRoot,
} from '@/components/readiness/ReadinessNavigationContext'
import {
  READINESS_FIELD_SCHEMA_ROOT,
  READINESS_HELPER_SCHEMA_FIELDS,
} from '@/lib/uxCopy'

interface SchemaSectionProps {
  tables: SchemaTable[]
  onChange: (tables: SchemaTable[]) => void
  isLocked: boolean
  docCompact?: boolean
}

function makeTable(name: string): SchemaTable {
  return {
    id: generateId(),
    physicalName: name,
    quantumName: name,
    tableType: 'table',
    description: '',
    columns: [],
    tags: [],
    quality: [],
    authoritativeDefinitions: [],
  }
}

export function SchemaSection({ tables, onChange, isLocked, docCompact }: SchemaSectionProps) {
  const fieldCount = tables.reduce((acc, t) => acc + t.columns.length, 0)
  const { setRef: sectionRootRef } = useSectionGuidanceRoot('schema')
  const { setRef: schemaAnchorRef, showEmphasis: showSchemaEmphasis, showDraftScan: showSchemaDraft } = useReadinessField(
    READINESS_FIELD_SCHEMA_ROOT,
    fieldCount === 0,
    true,
  )

  const [addingTable, setAddingTable] = useState(false)
  const [newName, setNewName] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingTable) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [addingTable])

  const openForm = () => { setNewName(''); setAddingTable(true) }

  const confirmAdd = () => {
    const name = newName.trim() || 'new_table'
    onChange([...tables, makeTable(name)])
    setAddingTable(false)
    setNewName('')
  }

  const cancelAdd = () => { setAddingTable(false); setNewName('') }

  const handleTableChange = (i: number, updated: SchemaTable) => {
    const next = [...tables]
    next[i] = updated
    onChange(next)
  }

  return (
    <div ref={sectionRootRef} className="w-full">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#12131f]">Schema</h2>
          <p className="text-[#3f3f4a] text-xs mt-0.5">
            Define tables and fields for this contract. Use the metadata control on each row for descriptions, tags, quality, and links.
          </p>
        </div>
        {!isLocked && (
          <Button size="sm" onClick={openForm} className="h-8 text-xs gap-1.5 flex-shrink-0">
            <Plus className="h-3.5 w-3.5" />
            Add table
          </Button>
        )}
      </div>

      {tables.length === 0 && !addingTable ? (
        <div
          ref={schemaAnchorRef}
          className={cn(
            'border-2 border-dashed rounded-xl p-16 flex flex-col items-center gap-4',
            showSchemaEmphasis
              ? 'border-[#fed7aa] bg-[#fff7ed]/60'
              : showSchemaDraft
                ? 'border-[#e4e2dc] bg-[#fafaf8]'
                : 'border-[#d3d3e5] bg-[#fbfbff]/50',
          )}
        >
          <Database className="h-6 w-6 text-[#656574]" />
          <div className="text-center">
            <p className="text-sm font-semibold text-[#12131f] mb-1">No tables defined</p>
            <p className="text-sm text-[#3f3f4a]">Import SQL to auto-populate, or add a table manually.</p>
            {showSchemaEmphasis ? (
              <p className="text-[11px] text-[#b8956a] leading-snug">{READINESS_HELPER_SCHEMA_FIELDS}</p>
            ) : null}
          </div>
          {!isLocked && (
            <Button onClick={openForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add first table
            </Button>
          )}
        </div>
      ) : (
        <SchemaNavigationProvider>
        <div ref={fieldCount === 0 ? schemaAnchorRef : undefined} className="space-y-4">
          {tables.map((table, i) => (
            <TableBlock
              key={`table-${i}`}
              table={table}
              tableIndex={i}
              allTables={tables}
              isLocked={isLocked}
              docCompact={docCompact}
              onTableChange={handleTableChange}
              onDeleteTable={idx => onChange(tables.filter((_, j) => j !== idx))}
            />
          ))}

          {!isLocked && (
            <div ref={formRef}>
              {addingTable ? (
                <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3.5 flex items-center gap-3">
                  <span className="text-xs font-medium text-neutral-500 flex-shrink-0">Table name</span>
                  <Input
                    ref={inputRef}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') cancelAdd() }}
                    placeholder="e.g. orders, products, users…"
                    className="h-8 text-sm flex-1"
                  />
                  <Button size="sm" onClick={confirmAdd} className="h-8 text-xs flex-shrink-0">
                    Create table
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelAdd} className="flex-shrink-0 text-neutral-400">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={openForm} className="h-8 text-xs gap-1.5 w-full">
                  <Plus className="h-3.5 w-3.5" />
                  Add table
                </Button>
              )}
            </div>
          )}
        </div>
        </SchemaNavigationProvider>
      )}
    </div>
  )
}
