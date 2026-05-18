import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { Copy, Check, AlertCircle, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DataContract, LifecycleStatus } from '@/types/odcs'
import { slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FundamentalsSectionProps {
  contract: DataContract
  onChange: (updates: Partial<DataContract['info']> & { id?: string }) => void
  isLocked: boolean
  isOwner: boolean
}

function TagInput({ tags, onChange, disabled }: { tags: string[]; onChange: (t: string[]) => void; disabled: boolean }) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const add = (val: string) => {
    const slug = val.trim().toLowerCase().replace(/\s+/g, '-')
    const tag  = slug.charAt(0).toUpperCase() + slug.slice(1)
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
      onClick={() => ref.current?.focus()}
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
          placeholder={tags.length === 0 ? 'Add tags (press Enter)...' : ''}
          className="flex-1 min-w-[120px] text-xs outline-none bg-transparent py-0.5"
        />
      )}
    </div>
  )
}

const STATUS_LABELS: Record<LifecycleStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  deprecated: 'Deprecated',
}

export function FundamentalsSection({ contract, onChange, isLocked, isOwner }: FundamentalsSectionProps) {
  const { info, id } = contract
  const [idManuallyEdited, setIdManuallyEdited] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Auto-derive ID from title if not manually edited
  useEffect(() => {
    if (!idManuallyEdited && info.title) {
      const slug = slugify(info.title)
      onChange({ id: slug })
    }
  }, [info.title, idManuallyEdited])

  const handleIdChange = (value: string) => {
    setIdManuallyEdited(true)
    if (/\s/.test(value)) {
      setIdError('ID cannot contain spaces. Use hyphens instead.')
    } else if (value && !/^[a-z0-9\-_]+$/.test(value)) {
      setIdError('Use only lowercase letters, numbers, hyphens, or underscores.')
    } else {
      setIdError(null)
    }
    onChange({ id: value })
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const tags = info.tags ?? []

  const ownerFieldLocked = isLocked || !isOwner
  const labelClass = 'text-xs font-medium text-[#33333d] mb-1 block'
  const inputClass = cn(isLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')
  const ownerInputClass = cn(ownerFieldLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')

  return (
    <div className="max-w-[560px] w-full">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#12131f]">Fundamentals</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5">Essential information that identifies and describes your contract.</p>
      </div>

      <div className="space-y-4">
        {/* Row 1: Contract name + Domain */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Contract name <span className="text-red-500">*</span>
            </label>
            <Input
              value={info.title}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="e.g. Customer Orders"
              disabled={isLocked}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Domain</label>
            <Input
              value={info.domain}
              onChange={e => onChange({ domain: e.target.value })}
              placeholder="e.g. Sales, Identity"
              disabled={isLocked}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 2: ID (full width) */}
        <div>
          <label className={labelClass}>
            ID <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={id}
              onChange={e => handleIdChange(e.target.value)}
              placeholder="customer-orders"
              disabled={ownerFieldLocked}
              className={cn(
                ownerInputClass,
                'font-mono text-sm flex-1',
                idError && 'border-[#c12c11] focus-visible:border-[#c12c11]'
              )}
            />
            <Button type="button" variant="outline" size="icon" onClick={handleCopyId} className="flex-shrink-0 h-9 w-9">
              {copied ? <Check className="h-3.5 w-3.5 text-green-700" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          {idError ? (
            <p className="text-[11px] text-[#c12c11] flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {idError}
            </p>
          ) : (
            <p className="text-[11px] text-[#656574] mt-1">
              Auto-generated from the contract name.
            </p>
          )}
        </div>

        {/* Row 3: Version + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Version</label>
            <div className="font-mono text-sm bg-[#f5f5fa] border border-[#d3d3e5] rounded-md px-3 h-9 flex items-center text-[#33333d]">
              v{info.version}
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <div className="h-9 flex items-center">
              <Badge variant={info.status}>{STATUS_LABELS[info.status]}</Badge>
            </div>
          </div>
        </div>

        {/* Row 4: Description */}
        <div>
          <label className={labelClass}>Description</label>
          <Textarea
            value={info.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Describe the purpose and scope of this data contract..."
            disabled={isLocked}
            className={cn(inputClass, 'min-h-[100px] resize-y text-sm')}
          />
        </div>

        {/* Row 5: Owner */}
        <div>
          <label className={labelClass}>
            Owner <span className="text-red-500">*</span>
          </label>
          <Input
            value={info.owner}
            onChange={e => onChange({ owner: e.target.value })}
            placeholder="e.g. Data Platform Team"
            disabled={ownerFieldLocked}
            className={ownerInputClass}
          />
        </div>

        {/* Row 6: Tags — pill input */}
        <div>
          <label className={labelClass}>Tags</label>
          <TagInput tags={tags} onChange={t => onChange({ tags: t })} disabled={isLocked} />
        </div>
      </div>
    </div>
  )
}
