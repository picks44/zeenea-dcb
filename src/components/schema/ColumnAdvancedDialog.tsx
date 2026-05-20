import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ColumnDefinition, ColumnForeignKey, PropertyItems, QualityRule, SchemaTable } from '@/types/odcs'
import { PropertyItemsEditor } from '@/components/schema/PropertyItemsEditor'
import { ColumnForeignKeyEditor } from '@/components/shared/ColumnForeignKeyEditor'
import { TagsEditor } from '@/components/shared/TagsEditor'
import { AuthoritativeDefinitionsEditor } from '@/components/shared/AuthoritativeDefinitionsEditor'
import { QualityRulesEditor } from '@/components/shared/QualityRulesEditor'
import { FieldMetadataReadOnlyBody } from '@/components/shared/MetadataModalReadOnly'
import { generateId } from '@/lib/utils'
import {
  filterAuthoritativeDefinitionsForPersist,
  filterAuthoritativeDefinitionsForSave,
  filterQualityRulesForSave,
  hasInvalidAuthoritativeDefinitions,
  migrateExamplesField,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import { isColumnForeignKeyPartial } from '@/lib/relationshipExport'
import { LABEL_QUALITY_RULES, LABEL_REFERENCE_LINKS } from '@/lib/uxCopy'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface ColumnAdvancedDialogProps {
  column: ColumnDefinition | null
  open: boolean
  allTables: SchemaTable[]
  sourceTableName: string
  isLocked?: boolean
  docCompact?: boolean
  onClose: () => void
  onSave: (updated: ColumnDefinition) => void
}

function loadColumnQuality(column: ColumnDefinition): QualityRule[] {
  if (column.quality?.length) return column.quality
  if (column.qualityRule?.trim()) {
    return [{
      id: column.id || generateId(),
      type: 'text',
      description: column.qualityRule.trim(),
    }]
  }
  return []
}

export function ColumnAdvancedDialog({
  column,
  open,
  allTables,
  sourceTableName,
  isLocked = false,
  docCompact = false,
  onClose,
  onSave,
}: ColumnAdvancedDialogProps) {
  const [description, setDescription] = useState('')
  const [examplesText, setExamplesText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>([])
  const [quality, setQuality] = useState<QualityRule[]>([])
  const [authShowErrors, setAuthShowErrors] = useState(false)
  const [fkShowErrors, setFkShowErrors] = useState(false)
  const [foreignKey, setForeignKey] = useState<ColumnForeignKey | undefined>()
  const [items, setItems] = useState<PropertyItems | undefined>()
  const openedColumnIdRef = useRef<string | null>(null)

  const columnFkKey = column
    ? `${column.foreignKey?.toTable ?? ''}\0${column.foreignKey?.toColumn ?? ''}`
    : ''

  useEffect(() => {
    if (!column || !open) {
      if (!open) openedColumnIdRef.current = null
      return
    }
    const opening = openedColumnIdRef.current !== column.id
    if (opening) {
      openedColumnIdRef.current = column.id
      setDescription(column.description ?? '')
      setExamplesText((column.examples ?? []).join('\n'))
      setTags(column.tags ?? [])
      setAuthDefs(filterAuthoritativeDefinitionsForSave(column.authoritativeDefinitions ?? []))
      setQuality(loadColumnQuality(column))
      setForeignKey(column.foreignKey)
      setItems(column.items)
      setAuthShowErrors(false)
      setFkShowErrors(false)
      return
    }
    setForeignKey(column.foreignKey)
  }, [column?.id, columnFkKey, open, column])

  if (!column) return null

  const handleSave = () => {
    if (hasInvalidAuthoritativeDefinitions(authDefs)) {
      setAuthShowErrors(true)
      return
    }
    if (isColumnForeignKeyPartial(foreignKey)) {
      setFkShowErrors(true)
      return
    }
    const savedQuality = filterQualityRulesForSave(quality)
    const savedAuth = filterAuthoritativeDefinitionsForPersist(authDefs)
    onSave({
      ...column,
      description: description.trim(),
      examples: migrateExamplesField(examplesText),
      tags: normalizeTags(tags),
      foreignKey: foreignKey?.toTable?.trim() && foreignKey?.toColumn?.trim() ? foreignKey : undefined,
      authoritativeDefinitions: savedAuth.length > 0 ? savedAuth : undefined,
      quality: savedQuality.length > 0 ? savedQuality : undefined,
      qualityRule: '',
      items: column.logicalType === 'array' ? items : undefined,
    })
    onClose()
  }

  const displayName = column.logicalName?.trim() || column.physicalName

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-sm">Field properties</DialogTitle>
          <DialogDescription className="font-mono text-xs text-neutral-400">
            <span className="block text-[10px] text-neutral-300 mb-0.5">id: {column.id}</span>
            {column.physicalName}
            {displayName !== column.physicalName ? (
              <span className="font-sans text-neutral-300"> · {displayName}</span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isLocked ? (
            <FieldMetadataReadOnlyBody
              description={description}
              examples={column.examples ?? []}
              tags={tags}
              quality={quality}
              authDefs={authDefs}
              foreignKey={foreignKey}
              sourceTableName={sourceTableName}
              sourceColumnName={column.physicalName}
              docCompact={docCompact}
            />
          ) : (
            <div className="space-y-5">
              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What does this field represent?"
                  rows={3}
                  className="text-sm resize-y min-h-[72px]"
                />
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">Examples</Label>
                <Textarea
                  value={examplesText}
                  onChange={e => setExamplesText(e.target.value)}
                  placeholder="One example per line"
                  rows={3}
                  className="text-sm resize-y"
                />
                <p className="text-[10px] text-neutral-400 mt-1">One value per line.</p>
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">Tags</Label>
                <TagsEditor tags={tags} onChange={setTags} />
              </div>

              {column.logicalType === 'array' && (
                <PropertyItemsEditor
                  items={items}
                  onChange={setItems}
                  disabled={isLocked}
                />
              )}

              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">Foreign key</Label>
                <ColumnForeignKeyEditor
                  foreignKey={foreignKey}
                  onChange={fk => {
                    setForeignKey(fk)
                    if (fkShowErrors) setFkShowErrors(false)
                  }}
                  sourceTableName={sourceTableName}
                  sourceColumnName={column.physicalName}
                  allTables={allTables}
                  compact={docCompact}
                  showFieldErrors={fkShowErrors}
                />
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">{LABEL_QUALITY_RULES}</Label>
                <QualityRulesEditor rules={quality} onChange={setQuality} compact={docCompact} />
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1 block">{LABEL_REFERENCE_LINKS}</Label>
                <AuthoritativeDefinitionsEditor
                  variant="zeenea"
                  definitions={authDefs}
                  onChange={defs => {
                    setAuthDefs(defs)
                    if (authShowErrors) setAuthShowErrors(false)
                  }}
                  compact={docCompact}
                  showFieldErrors={authShowErrors}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          {isLocked ? (
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
