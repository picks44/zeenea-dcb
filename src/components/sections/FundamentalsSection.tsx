import { useEffect, useRef, useState } from 'react'
import { Copy, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DataContract, LifecycleStatus } from '@/types/odcs'
import { TagsEditor } from '@/components/shared/TagsEditor'
import { AuthoritativeDefinitionsEditor } from '@/components/shared/AuthoritativeDefinitionsEditor'
import { slugify, cn } from '@/lib/utils'
import { filterAuthoritativeDefinitionsForSave } from '@/lib/odcsSharedMappers'
import { CONTRACT_OWNER_HELPER } from '@/lib/uxCopy'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface FundamentalsSectionProps {
  contract: DataContract
  onChange: (updates: Partial<DataContract['info']> & { id?: string }) => void
  isLocked: boolean
  isOwner: boolean
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
  const [additionalOpen, setAdditionalOpen] = useState(true)
  const [usage, setUsage] = useState(info.descriptionUsage ?? '')
  const [limitations, setLimitations] = useState(info.descriptionLimitations ?? '')
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>(
    info.descriptionAuthoritativeDefinitions ?? [],
  )

  useEffect(() => {
    if (!idManuallyEdited && info.title) {
      const slug = slugify(info.title)
      onChange({ id: slug })
    }
  }, [info.title, idManuallyEdited])

  useEffect(() => {
    setUsage(info.descriptionUsage ?? '')
    setLimitations(info.descriptionLimitations ?? '')
    setAuthDefs(info.descriptionAuthoritativeDefinitions ?? [])
  }, [contract.uid, info.descriptionUsage, info.descriptionLimitations, info.descriptionAuthoritativeDefinitions])

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

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (isLocked) return
    const timer = window.setTimeout(() => {
      onChangeRef.current({
        descriptionUsage: usage.trim() || undefined,
        descriptionLimitations: limitations.trim() || undefined,
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [usage, limitations, isLocked])

  const tags = info.tags ?? []

  const ownerFieldLocked = isLocked || !isOwner
  const labelClass = 'text-xs font-medium text-[#33333d] mb-1 block'
  const inputClass = cn(isLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')
  const ownerInputClass = cn(ownerFieldLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')

  return (
    <div className="max-w-[560px] w-full">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#12131f]">Fundamentals</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5">
          Core contract metadata and governance documentation.
        </p>
      </div>

      <div className="space-y-4">
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
                idError && 'border-[#c12c11] focus-visible:border-[#c12c11]',
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

        <div>
          <label className={labelClass}>Business purpose</label>
          <Textarea
            value={info.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Describe the purpose and scope of this data contract..."
            disabled={isLocked}
            className={cn(inputClass, 'min-h-[100px] resize-y text-sm')}
          />
        </div>

        <div className="border border-[#e4e4f0] rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-[#33333d] bg-[#fbfbff] hover:bg-[#f5f5fa] transition-colors"
            onClick={() => setAdditionalOpen(o => !o)}
          >
            {additionalOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Additional context
          </button>
          {additionalOpen && (
            <div className="px-3 py-3 space-y-3 border-t border-[#e4e4f0]">
              <div>
                <label className={labelClass}>Usage</label>
                <Textarea
                  value={usage}
                  onChange={e => setUsage(e.target.value)}
                  placeholder="Describe expected usage patterns or supported use cases"
                  disabled={isLocked}
                  className={cn(inputClass, 'min-h-[72px] resize-y text-sm')}
                />
              </div>
              <div>
                <label className={labelClass}>Limitations</label>
                <Textarea
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  placeholder="Document quality, compliance, retention, or latency constraints"
                  disabled={isLocked}
                  className={cn(inputClass, 'min-h-[72px] resize-y text-sm')}
                />
              </div>
              <div>
                <label className={labelClass}>Authoritative links</label>
                <AuthoritativeDefinitionsEditor
                  definitions={authDefs}
                  onChange={defs => {
                    setAuthDefs(defs)
                    if (!isLocked) {
                      onChange({
                        descriptionAuthoritativeDefinitions: filterAuthoritativeDefinitionsForSave(defs),
                      })
                    }
                  }}
                  disabled={isLocked}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Governance owner <span className="text-red-500">*</span>
          </label>
          <Input
            value={info.owner}
            onChange={e => onChange({ owner: e.target.value })}
            placeholder="e.g. Data Platform Team"
            disabled={ownerFieldLocked}
            className={ownerInputClass}
          />
          <p className="text-[11px] text-[#656574] mt-1 leading-snug">
            {CONTRACT_OWNER_HELPER}
          </p>
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <TagsEditor
            tags={tags}
            onChange={t => onChange({ tags: t })}
            disabled={isLocked}
            placeholder="Add governance, domain, or classification tags"
          />
        </div>
      </div>
    </div>
  )
}
