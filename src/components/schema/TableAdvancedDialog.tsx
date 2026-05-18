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
import { SchemaTable } from '@/types/odcs'
import { TagsEditor } from '@/components/shared/TagsEditor'
import { QualityRulesEditor } from '@/components/shared/QualityRulesEditor'
import { AuthoritativeDefinitionsEditor } from '@/components/shared/AuthoritativeDefinitionsEditor'
import {
  filterAuthoritativeDefinitionsForSave,
  filterQualityRulesForSave,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface TableAdvancedDialogProps {
  table: SchemaTable | null
  open: boolean
  isLocked?: boolean
  onClose: () => void
  onSave: (updated: SchemaTable) => void
}

export function TableAdvancedDialog({ table, open, isLocked = false, onClose, onSave }: TableAdvancedDialogProps) {
  const [tags, setTags] = useState<string[]>([])
  const [quality, setQuality] = useState<SchemaTable['quality']>([])
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>([])

  useEffect(() => {
    if (!table || !open) return
    setTags(table.tags ?? [])
    setQuality(table.quality ?? [])
    setAuthDefs(table.authoritativeDefinitions ?? [])
  }, [table, open])

  if (!table) return null

  const handleSave = () => {
    onSave({
      ...table,
      tags: normalizeTags(tags),
      quality: filterQualityRulesForSave(quality ?? []),
      authoritativeDefinitions: filterAuthoritativeDefinitionsForSave(authDefs),
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Table metadata</DialogTitle>
          <DialogDescription className="font-mono text-xs">{table.physicalName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div>
            <p className="text-xs font-medium text-[#33333d] mb-1">Tags</p>
            <TagsEditor tags={tags} onChange={setTags} disabled={isLocked} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#33333d] mb-1">Quality rules</p>
            <QualityRulesEditor rules={quality ?? []} onChange={setQuality} disabled={isLocked} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#33333d] mb-1">Authoritative links</p>
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
