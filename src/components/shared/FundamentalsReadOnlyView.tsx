import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataContract, LifecycleStatus } from '@/types/odcs'
import { ReadOnlyField } from '@/components/shared/ReadOnlyField'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import { CONTRACT_OWNER_HELPER } from '@/lib/uxCopy'
import { AUTH_DEF_TYPE_OPTIONS } from '@/types/odcsShared'
const STATUS_LABELS: Record<LifecycleStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  deprecated: 'Deprecated',
}

function authTypeLabel(type: string): string {
  return AUTH_DEF_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type
}

interface FundamentalsReadOnlyViewProps {
  contract: DataContract
}

export function FundamentalsReadOnlyView({ contract }: FundamentalsReadOnlyViewProps) {
  const { info, id } = contract
  const [copied, setCopied] = useState(false)
  const [additionalOpen, setAdditionalOpen] = useState(true)

  const tags = info.tags ?? []
  const authDefs = (info.descriptionAuthoritativeDefinitions ?? []).filter(
    d => d.url.trim() || d.type.trim() || (d.description ?? '').trim(),
  )

  const handleCopyId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Contract name" value={info.title} required />
        <ReadOnlyField label="Domain" value={info.domain} />
      </div>

      <div>
        <ReadOnlyField label="ID" value={id} required mono />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyId}
          className="mt-2 h-8 gap-1.5 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#047800]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy ID'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Version" value={`v${info.version}`} mono />
        <div>
          <span className="text-xs font-medium text-[#33333d] mb-1 block">Status</span>
          <Badge variant={info.status}>{STATUS_LABELS[info.status]}</Badge>
        </div>
      </div>

      <ReadOnlyField label="Business purpose" value={info.description} multiline />

      <div className="border border-[#e4e4f0] rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-[#33333d] bg-[#fbfbff]"
          onClick={() => setAdditionalOpen(o => !o)}
        >
          {additionalOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Additional context
        </button>
        {additionalOpen && (
          <div className="px-3 py-3 space-y-3 border-t border-[#e4e4f0]">
            <ReadOnlyField label="Usage" value={info.descriptionUsage ?? ''} multiline />
            <ReadOnlyField label="Limitations" value={info.descriptionLimitations ?? ''} multiline />
            <div>
              <span className="text-xs font-medium text-[#33333d] mb-1 block">Authoritative links</span>
              {authDefs.length === 0 ? (
                <p className="text-sm text-[#9898a7]">—</p>
              ) : (
                <ul className="space-y-2">
                  {authDefs.map(def => (
                    <li
                      key={def.id}
                      className="text-xs text-[#656574] border border-[#e4e4f0] rounded-lg px-3 py-2 bg-[#fbfbff]/40"
                    >
                      <p className="font-mono text-[11px] text-[#33333d] break-all">{def.url || '—'}</p>
                      {def.type ? (
                        <p className="text-[10px] text-[#9898a7] mt-0.5">{authTypeLabel(def.type)}</p>
                      ) : null}
                      {def.description?.trim() ? (
                        <p className="text-[11px] mt-1 leading-snug">{def.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <ReadOnlyField label="Governance owner" value={info.owner} required />
        <p className="text-[11px] text-[#656574] mt-1 leading-snug flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span>{CONTRACT_OWNER_HELPER}</span>
          <WorkflowMetadataPill variant="not-in-odcs" />
        </p>
      </div>

      <div>
        <span className="text-xs font-medium text-[#33333d] mb-1 block">Tags</span>
        {tags.length === 0 ? (
          <p className="text-sm text-[#9898a7]">—</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <Badge key={tag} variant="tag">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
