import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataContract } from '@/types/odcs'
import { ReadOnlyField } from '@/components/shared/ReadOnlyField'
import { InlineCopyButton } from '@/components/shared/InlineCopyButton'
import { CONTRACT_OWNER_HELPER, LABEL_CONTRACT_OWNER, LABEL_REFERENCE_LINKS } from '@/lib/uxCopy'
import { authDefTypeLabel } from '@/components/shared/authDefLabels'
import { cn } from '@/lib/utils'
import { docShellClass, DOC_COMPACT_SPACING, DOC_COMPACT_TEXT } from '@/components/shared/docViewTokens'

function authTypeLabel(type: string): string {
  return authDefTypeLabel(type)
}

interface FundamentalsReadOnlyViewProps {
  contract: DataContract
  compact?: boolean
}

export function FundamentalsReadOnlyView({ contract, compact }: FundamentalsReadOnlyViewProps) {
  const { info, id } = contract

  const tags = info.tags ?? []
  const authDefs = (info.descriptionAuthoritativeDefinitions ?? []).filter(
    d => d.url.trim() || d.type.trim() || (d.description ?? '').trim(),
  )

  const usage = (info.descriptionUsage ?? '').trim()
  const limitations = (info.descriptionLimitations ?? '').trim()
  const hasAdditionalContext = Boolean(usage || limitations || authDefs.length > 0)
  const [additionalOpen, setAdditionalOpen] = useState(hasAdditionalContext)

  const ownerName = info.owner.trim() || '—'

  return (
    <div className={cn(compact ? DOC_COMPACT_SPACING.sectionStack : 'space-y-3')}>
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2',
          compact ? DOC_COMPACT_SPACING.gridGap : 'gap-x-4 gap-y-3',
        )}
      >
        <ReadOnlyField label="Contract name" value={info.title} required compact={compact} />
        <ReadOnlyField label="Domain" value={info.domain} compact={compact} />

        <div>
          <span className={cn(compact ? DOC_COMPACT_TEXT.label : 'text-xs font-medium text-[#33333d] mb-0.5 block')}>
            ID<span className="text-red-500"> *</span>
          </span>
          <div className="flex items-baseline gap-0.5 min-w-0">
            <p
              className={cn(
                'font-mono truncate min-w-0',
                compact ? DOC_COMPACT_TEXT.value : 'text-[13px] text-[#33333d]',
                !id.trim() && 'text-[#9898a7]',
              )}
            >
              {id.trim() || '—'}
            </p>
            {id.trim() ? (
              <InlineCopyButton value={id} ariaLabel="Copy contract ID" dense={compact} />
            ) : null}
          </div>
        </div>

        <div>
          <span className={cn(compact ? DOC_COMPACT_TEXT.label : 'text-xs font-medium text-[#33333d] mb-0.5 block')}>
            Version
          </span>
          <span className={cn('font-mono', compact ? DOC_COMPACT_TEXT.value : 'text-[13px] text-[#33333d]')}>
            v{info.version}
          </span>
        </div>
      </div>

      <ReadOnlyField label="Business purpose" value={info.description} multiline compact={compact} />

      <div className={docShellClass}>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-1.5 text-left text-xs font-medium text-[#33333d]',
            compact ? 'px-3 py-1.5 bg-transparent' : 'px-3 py-2 bg-[#fbfbff]/60',
          )}
          onClick={() => setAdditionalOpen(o => !o)}
        >
          {additionalOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
          <span className="flex-1 min-w-0">Additional context</span>
          {!hasAdditionalContext && !additionalOpen ? (
            <span className={cn('font-normal truncate', compact ? DOC_COMPACT_TEXT.muted : 'text-[10px] text-[#9898a7]')}>
              None provided
            </span>
          ) : null}
        </button>
        {additionalOpen && hasAdditionalContext && (
          <div className={cn('px-3 border-t border-[#e4e4f0]', compact ? 'py-1.5 space-y-1.5' : 'py-2 space-y-2')}>
            {usage ? <ReadOnlyField label="Usage" value={usage} multiline compact /> : null}
            {limitations ? <ReadOnlyField label="Limitations" value={limitations} multiline compact /> : null}
            {authDefs.length > 0 ? (
              <div>
                <span className={DOC_COMPACT_TEXT.label}>{LABEL_REFERENCE_LINKS}</span>
                <ul className="space-y-1">
                  {authDefs.map(def => (
                    <li key={def.id} className="text-[11px] leading-snug">
                      <p className="font-mono text-[#33333d] break-all">{def.url || '—'}</p>
                      {def.type ? (
                        <p className={DOC_COMPACT_TEXT.muted}>{authTypeLabel(def.type)}</p>
                      ) : null}
                      {def.description?.trim() ? (
                        <p className="text-[#656574]">{def.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {additionalOpen && !hasAdditionalContext && (
          <p className={cn('px-3 pb-2', DOC_COMPACT_TEXT.muted)}>
            No additional governance context provided.
          </p>
        )}
      </div>

      <div>
        <span className={cn(compact ? DOC_COMPACT_TEXT.label : 'text-xs font-medium text-[#33333d] mb-0.5 block')}>
          {LABEL_CONTRACT_OWNER}<span className="text-red-500"> *</span>
        </span>
        <span className={cn(compact ? DOC_COMPACT_TEXT.value : 'text-sm text-[#33333d]')}>{ownerName}</span>
        <p className={cn('mt-0.5', compact ? DOC_COMPACT_TEXT.muted : 'text-[11px] text-[#656574] leading-snug')}>
          {CONTRACT_OWNER_HELPER}
        </p>
      </div>

      <div>
        <span className={cn(compact ? DOC_COMPACT_TEXT.label : 'text-xs font-medium text-[#33333d] mb-0.5 block')}>
          Tags
        </span>
        {tags.length === 0 ? (
          <p className={cn(compact ? DOC_COMPACT_TEXT.muted : 'text-[13px] text-[#9898a7]')}>—</p>
        ) : (
          <div className="flex flex-wrap gap-0.5">
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="tag"
                className={compact ? 'px-1.5 py-0 text-[10px] leading-4 font-normal' : undefined}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
