import { useState, useEffect } from 'react'
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
import { ColumnDefinition, QualityRule } from '@/types/odcs'
import { TagsEditor } from '@/components/shared/TagsEditor'
import { AuthoritativeDefinitionsEditor } from '@/components/shared/AuthoritativeDefinitionsEditor'
import { QualityRulesEditor } from '@/components/shared/QualityRulesEditor'
import { FieldMetadataReadOnlyBody } from '@/components/shared/MetadataModalReadOnly'
import { generateId } from '@/lib/utils'
import {
  filterAuthoritativeDefinitionsForSave,
  filterQualityRulesForSave,
  migrateExamplesField,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface ColumnAdvancedDialogProps {
  column: ColumnDefinition | null
  open: boolean
  isLocked?: boolean
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

export function ColumnAdvancedDialog({ column, open, isLocked = false, onClose, onSave }: ColumnAdvancedDialogProps) {
  const [description, setDescription] = useState('')
  const [examplesText, setExamplesText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>([])
  const [quality, setQuality] = useState<QualityRule[]>([])

  useEffect(() => {
    if (!column || !open) return
    setDescription(column.description ?? '')
    setExamplesText((column.examples ?? []).join('\n'))
    setTags(column.tags ?? [])
    setAuthDefs(column.authoritativeDefinitions ?? [])
    setQuality(loadColumnQuality(column))
  }, [column, open])

  if (!column) return null

  const handleSave = () => {
    const savedQuality = filterQualityRulesForSave(quality)
    onSave({
      ...column,
      description: description.trim(),
      examples: migrateExamplesField(examplesText),
      tags: normalizeTags(tags),
      authoritativeDefinitions: filterAuthoritativeDefinitionsForSave(authDefs),
      quality: savedQuality.length > 0 ? savedQuality : undefined,
      qualityRule: '',
    })
    onClose()
  }

  const displayName = column.logicalName?.trim() || column.physicalName

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-sm">Field properties</DialogTitle>
          <DialogDescription className="font-mono text-xs text-[#656574]">
            {column.physicalName}
            {displayName !== column.physicalName ? (
              <span className="font-sans text-[#9898a7]"> · {displayName}</span>
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
            />
          ) : (
            <div className="space-y-5">
              <div>
                <Label className="text-xs text-[#33333d] mb-1 block">Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What does this field represent?"
                  rows={3}
                  className="text-sm resize-y min-h-[72px]"
                />
              </div>

              <div>
                <Label className="text-xs text-[#33333d] mb-1 block">Examples</Label>
                <Textarea
                  value={examplesText}
                  onChange={e => setExamplesText(e.target.value)}
                  placeholder="One example per line"
                  rows={3}
                  className="text-sm resize-y"
                />
                <p className="text-[10px] text-[#656574] mt-1">One value per line.</p>
              </div>

              <div>
                <Label className="text-xs text-[#33333d] mb-1 block">Tags</Label>
                <TagsEditor tags={tags} onChange={setTags} />
              </div>

              <div>
                <Label className="text-xs text-[#33333d] mb-1 block">Quality rules</Label>
                <QualityRulesEditor rules={quality} onChange={setQuality} />
              </div>

              <div>
                <Label className="text-xs text-[#33333d] mb-1 block">Authoritative links</Label>
                <AuthoritativeDefinitionsEditor definitions={authDefs} onChange={setAuthDefs} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t border-[#e4e4f0] flex-shrink-0">
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
