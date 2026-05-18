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

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Field properties</DialogTitle>
          <DialogDescription className="font-mono text-xs">{column.physicalName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <Label className="text-xs text-[#33333d] mb-1 block">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this field represent?"
              rows={3}
              disabled={isLocked}
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
              disabled={isLocked}
              className="text-sm resize-y"
            />
            <p className="text-[10px] text-[#656574] mt-1">One value per line.</p>
          </div>

          <div>
            <Label className="text-xs text-[#33333d] mb-1 block">Tags</Label>
            <TagsEditor tags={tags} onChange={setTags} disabled={isLocked} />
          </div>

          <div>
            <Label className="text-xs text-[#33333d] mb-1 block">Quality rules</Label>
            <QualityRulesEditor rules={quality} onChange={setQuality} disabled={isLocked} />
          </div>

          <div>
            <Label className="text-xs text-[#33333d] mb-1 block">Authoritative links</Label>
            <AuthoritativeDefinitionsEditor
              definitions={authDefs}
              onChange={setAuthDefs}
              disabled={isLocked}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>{isLocked ? 'Close' : 'Cancel'}</Button>
          {!isLocked && <Button size="sm" onClick={handleSave}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
