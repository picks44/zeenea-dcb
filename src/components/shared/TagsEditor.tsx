import { useState, useRef, KeyboardEvent } from 'react'
import { X as XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagsEditorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export function TagsEditor({ tags, onChange, disabled = false, placeholder }: TagsEditorProps) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const add = (val: string) => {
    const tag = val.trim()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
    if (e.key === 'Backspace' && !input && tags.length > 0) remove(tags[tags.length - 1])
  }

  return (
    <div
      className="min-h-[36px] border border-[#d3d3e5] rounded px-2 py-1 flex flex-wrap gap-1 items-center cursor-text hover:border-[#9898a7] focus-within:border-2 focus-within:border-[#0550dc] bg-white transition-colors"
      onClick={() => !disabled && ref.current?.focus()}
    >
      {tags.map(tag => (
        <Badge key={tag} variant="tag" className="gap-1">
          {tag}
          {!disabled && (
            <button type="button" onClick={() => remove(tag)} className="hover:text-blue-800 ml-0.5">
              <XIcon className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <input
          ref={ref}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => { if (input) add(input) }}
          placeholder={placeholder ?? (tags.length === 0 ? 'Add tags (press Enter)...' : '')}
          className="flex-1 min-w-[120px] text-xs outline-none bg-transparent py-0.5"
        />
      )}
    </div>
  )
}
