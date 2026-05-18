import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataContract, LifecycleStatus } from '@/types/odcs'
import { ReadOnlyField } from '@/components/shared/ReadOnlyField'
import { InlineCopyButton } from '@/components/shared/InlineCopyButton'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import { CONTRACT_OWNER_HELPER } from '@/lib/uxCopy'
import { AUTH_DEF_TYPE_OPTIONS } from '@/types/odcsShared'
import { cn } from '@/lib/utils'
import { docShellClass } from '@/components/shared/docViewTokens'

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
  compact?: boolean
}

export function FundamentalsReadOnlyView({ contract, compact }: FundamentalsReadOnlyViewProps) {
  const { info, id } = contract
  const [additionalOpen, setAdditionalOpen] = useState(true)

  const tags = info.tags ?? []
  const authDefs = (info.descriptionAuthoritativeDefinitions ?? []).filter(
    d => d.url.trim() || d.type.trim() || (d.description ?? '').trim(),
  )

  const usage = (info.descriptionUsage ?? '').trim()
  const limitations = (info.descriptionLimitations ?? '').trim()
  const hasAdditionalContext = Boolean(usage || limitations || authDefs.length > 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        <ReadOnlyField label="Contract name" value={info.title} required compact={compact} />
        <ReadOnlyField label="Domain" value={info.domain} compact={compact} />

        <div>
          <span className={cn('text-xs font-medium text-[#33333d] block', compact ? 'mb-0.5' : 'mb-1')}>
            ID<span className="text-red-500"> *</span>
          </span>
          <div className="flex items-center gap-1 min-w-0">
            <p className={cn('text-[13px] font-mono text-[#33333d] truncate min-w-0', !id.trim() && 'text-[#9898a7]')}>
              {id.trim() || '—'}
            </p>
            {id.trim() ? <InlineCopyButton value={id} ariaLabel="Copy contract ID" /> : null}
          </div>
        </div>

        <div>
          <span className={cn('text-xs font-medium text-[#33333d] block', compact ? 'mb-0.5' : 'mb-1')}>
            Version & status
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-mono text-[#33333d]">v{info.version}</span>
            <Badge variant={info.status}>{STATUS_LABELS[info.status]}</Badge>
          </div>
        </div>
      </div>

      <ReadOnlyField label="Business purpose" value={info.description} multiline compact={compact} />

      <div className={docShellClass}>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#33333d] bg-[#fbfbff]/60"
          onClick={() => setAdditionalOpen(o => !o)}
        >
          {additionalOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Additional context
        </button>
        {additionalOpen && (
          <div className="px-3 py-2 border-t border-[#e4e4f0] space-y-2">
            {!hasAdditionalContext ? (
              <p className="text-xs text-[#9898a7] leading-snug">
                No additional governance context provided.
              </p>
            ) : (
              <>
                {usage ? <ReadOnlyField label="Usage" value={usage} multiline compact /> : null}
                {limitations ? <ReadOnlyField label="Limitations" value={limitations} multiline compact /> : null}
                {authDefs.length > 0 ? (
                  <div>
                    <span className="text-xs font-medium text-[#33333d] mb-0.5 block">Authoritative links</span>
                    <ul className="space-y-1.5">
                      {authDefs.map(def => (
                        <li key={def.id} className="text-xs leading-snug">
                          <p className="font-mono text-[11px] text-[#33333d] break-all">{def.url || '—'}</p>
                          {def.type ? (
                            <p className="text-[10px] text-[#9898a7]">{authTypeLabel(def.type)}</p>
                          ) : null}
                          {def.description?.trim() ? (
                            <p className="text-[11px] text-[#656574] mt-0.5">{def.description}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <ReadOnlyField label="Governance owner" value={info.owner} required compact={compact} />
        <p className="text-[11px] text-[#656574] mt-1 leading-snug flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span>{CONTRACT_OWNER_HELPER}</span>
          <WorkflowMetadataPill variant="not-in-odcs" />
        </p>
      </div>

      <div>
        <span className={cn('text-xs font-medium text-[#33333d] block', compact ? 'mb-0.5' : 'mb-1')}>Tags</span>
        {tags.length === 0 ? (
          <p className="text-[13px] text-[#9898a7]">—</p>
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
