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
import { TableMetadataReadOnlyBody } from '@/components/shared/MetadataModalReadOnly'
import {
  filterAuthoritativeDefinitionsForPersist,
  filterAuthoritativeDefinitionsForSave,
  filterQualityRulesForSave,
  hasInvalidAuthoritativeDefinitions,
  normalizeTags,
} from '@/lib/odcsSharedMappers'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface TableAdvancedDialogProps {
  table: SchemaTable | null
  open: boolean
  isLocked?: boolean
  docCompact?: boolean
  onClose: () => void
  onSave: (updated: SchemaTable) => void
}

export function TableAdvancedDialog({
  table,
  open,
  isLocked = false,
  docCompact = false,
  onClose,
  onSave,
}: TableAdvancedDialogProps) {
  const [tags, setTags] = useState<string[]>([])
  const [quality, setQuality] = useState<SchemaTable['quality']>([])
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>([])
  const [authShowErrors, setAuthShowErrors] = useState(false)

  useEffect(() => {
    if (!table || !open) return
    setTags(table.tags ?? [])
    setQuality(table.quality ?? [])
    setAuthDefs(filterAuthoritativeDefinitionsForSave(table.authoritativeDefinitions ?? []))
    setAuthShowErrors(false)
  }, [table, open])

  if (!table) return null

  const handleSave = () => {
    if (hasInvalidAuthoritativeDefinitions(authDefs)) {
      setAuthShowErrors(true)
      return
    }
    const savedAuth = filterAuthoritativeDefinitionsForPersist(authDefs)
    onSave({
      ...table,
      tags: normalizeTags(tags),
      quality: filterQualityRulesForSave(quality ?? []),
      authoritativeDefinitions: savedAuth.length > 0 ? savedAuth : undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-sm">Table metadata</DialogTitle>
          <DialogDescription className="font-mono text-xs text-[#656574]">
            {table.physicalName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isLocked ? (
            <TableMetadataReadOnlyBody
              tags={tags}
              quality={quality ?? []}
              authDefs={authDefs}
            />
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-[#33333d] mb-1">Tags</p>
                <TagsEditor tags={tags} onChange={setTags} />
              </div>

              <div>
                <p className="text-xs font-medium text-[#33333d] mb-1">Quality rules</p>
                <QualityRulesEditor rules={quality ?? []} onChange={setQuality} compact={docCompact} />
              </div>

              <div>
                <p className="text-xs font-medium text-[#33333d] mb-1">Authoritative links</p>
                <AuthoritativeDefinitionsEditor
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
