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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ColumnDefinition, QualityRule } from '@/types/odcs'
import { generateId } from '@/lib/utils'

interface ColumnAdvancedDialogProps {
  column: ColumnDefinition | null
  open: boolean
  isLocked?: boolean
  onClose: () => void
  onSave: (updated: ColumnDefinition) => void
}

export function ColumnAdvancedDialog({ column, open, isLocked = false, onClose, onSave }: ColumnAdvancedDialogProps) {
  const [description, setDescription] = useState('')
  const [qualityExpr, setQualityExpr] = useState('')
  const [qualityName, setQualityName] = useState('')
  const [dimension, setDimension] = useState('')
  const [severity, setSeverity] = useState('')
  const [businessImpact, setBusinessImpact] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (!column || !open) return
    setDescription(column.description ?? '')
    const q = column.quality?.[0]
    setQualityExpr(q?.description ?? column.qualityRule ?? '')
    setQualityName(q?.name ?? '')
    setDimension(q?.dimension ?? '')
    setSeverity(q?.severity ?? '')
    setBusinessImpact(q?.businessImpact ?? '')
    setShowAdvanced(!!(q?.name || q?.dimension || q?.severity || q?.businessImpact))
  }, [column, open])

  if (!column) return null

  const handleSave = () => {
    let quality: QualityRule[] | undefined
    const expr = qualityExpr.trim()
    if (expr) {
      const rule: QualityRule = {
        id: column.quality?.[0]?.id ?? generateId(),
        type: 'text',
        description: expr,
      }
      if (qualityName.trim()) rule.name = qualityName.trim()
      if (dimension.trim()) rule.dimension = dimension.trim()
      if (severity.trim()) rule.severity = severity.trim()
      if (businessImpact.trim()) rule.businessImpact = businessImpact.trim()
      quality = [rule]
    }

    onSave({
      ...column,
      description: description.trim(),
      quality,
      qualityRule: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
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
            <Label className="text-xs text-[#33333d] mb-1 block">Data quality rule</Label>
            <Textarea
              value={qualityExpr}
              onChange={e => setQualityExpr(e.target.value)}
              placeholder="Describe the rule in plain language, e.g. Must not be null"
              rows={2}
              disabled={isLocked}
              className="text-sm resize-y"
            />
            <p className="text-[10px] text-[#656574] mt-1">Exported as a natural-language quality rule (type: text).</p>
          </div>

          <div>
            <button
              type="button"
              className="text-xs text-[#0550dc] font-medium hover:underline"
              onClick={() => setShowAdvanced(v => !v)}
            >
              {showAdvanced ? 'Hide' : 'Show'} optional quality metadata
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-2 pl-0">
                <Input value={qualityName} onChange={e => setQualityName(e.target.value)} placeholder="Rule name" disabled={isLocked} className="h-8 text-xs" />
                <Input value={dimension} onChange={e => setDimension(e.target.value)} placeholder="Dimension (e.g. completeness)" disabled={isLocked} className="h-8 text-xs" />
                <Input value={severity} onChange={e => setSeverity(e.target.value)} placeholder="Severity (e.g. error)" disabled={isLocked} className="h-8 text-xs" />
                <Input value={businessImpact} onChange={e => setBusinessImpact(e.target.value)} placeholder="Business impact" disabled={isLocked} className="h-8 text-xs" />
              </div>
            )}
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
