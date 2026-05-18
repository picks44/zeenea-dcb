import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { AuthoritativeDefinition } from '@/types/odcsShared'
import { AUTH_DEF_TYPE_OPTIONS } from '@/types/odcsShared'
import { generateId } from '@/lib/utils'

interface AuthoritativeDefinitionsEditorProps {
  definitions: AuthoritativeDefinition[]
  onChange: (defs: AuthoritativeDefinition[]) => void
  disabled?: boolean
}

function emptyRow(): AuthoritativeDefinition {
  return { id: generateId(), url: '', type: '', description: '' }
}

export function AuthoritativeDefinitionsEditor({
  definitions,
  onChange,
  disabled = false,
}: AuthoritativeDefinitionsEditorProps) {
  const rows = definitions.length > 0 ? definitions : [emptyRow()]

  const update = (id: string, patch: Partial<AuthoritativeDefinition>) => {
    onChange(rows.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  const add = () => onChange([...rows, emptyRow()])

  const remove = (id: string) => {
    const next = rows.filter(r => r.id !== id)
    onChange(next.length > 0 ? next : [emptyRow()])
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#656574]">
        Link to glossary, policy, documentation, or a Zeenea catalog reference (no picker in this MVP).
      </p>
      {rows.map(row => (
        <div key={row.id} className="border border-[#e4e4f0] rounded-lg p-3 space-y-2 bg-[#fbfbff]/50">
          <div className="grid grid-cols-[1fr_140px] gap-2">
            <div>
              <Label className="text-[10px] text-[#656574] mb-0.5 block">URL</Label>
              <Input
                value={row.url}
                onChange={e => update(row.id, { url: e.target.value })}
                placeholder="https://..."
                disabled={disabled}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] text-[#656574] mb-0.5 block">Type</Label>
              <Select
                value={row.type || undefined}
                onValueChange={v => v && update(row.id, { type: v })}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {AUTH_DEF_TYPE_OPTIONS.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-[#656574] mb-0.5 block">Description (optional)</Label>
            <Textarea
              value={row.description ?? ''}
              onChange={e => update(row.id, { description: e.target.value })}
              rows={2}
              disabled={disabled}
              className="text-xs resize-y min-h-[48px]"
            />
          </div>
          {!disabled && rows.length > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(row.id)} className="h-7 text-xs text-red-600">
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add link
        </Button>
      )}
    </div>
  )
}
