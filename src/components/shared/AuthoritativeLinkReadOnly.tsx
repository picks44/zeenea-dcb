import { cn } from '@/lib/utils'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { DOC_COMPACT_ROW } from '@/components/shared/docViewTokens'
import type { AuthoritativeDefinition } from '@/types/odcsShared'
import { authDefTypeLabel } from '@/components/shared/authDefLabels'
import { REFERENCE_LINKS_EMPTY } from '@/lib/uxCopy'

function authTypeLabel(type: string): string {
  return authDefTypeLabel(type)
}

function linkHasContent(def: AuthoritativeDefinition): boolean {
  return Boolean(def.url.trim() || def.type.trim() || (def.description ?? '').trim())
}

function AuthoritativeLinkReadOnlyRow({ def, compact }: { def: AuthoritativeDefinition; compact?: boolean }) {
  const type = def.type.trim() ? authTypeLabel(def.type) : ''
  const url = def.url.trim()
  const desc = (def.description ?? '').trim()
  const rowClass = cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2.5')

  if (!type && !url) {
    return (
      <div className={rowClass}>
        <p className="text-xs text-[#33333d] leading-relaxed whitespace-pre-wrap">{desc}</p>
      </div>
    )
  }

  return (
    <div className={rowClass}>
      {type ? <p className="text-xs font-medium text-[#12131f] leading-snug">{type}</p> : null}
      {url ? (
        <p className={cn(type && 'mt-0.5')}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0550dc] hover:underline break-all leading-snug"
          >
            {url}
          </a>
        </p>
      ) : null}
      {desc ? (
        <p className="text-[11px] text-[#656574] mt-0.5 leading-relaxed whitespace-pre-wrap">{desc}</p>
      ) : null}
    </div>
  )
}

interface AuthoritativeLinkReadOnlyProps {
  definitions: AuthoritativeDefinition[]
  emptyLabel?: string
  compact?: boolean
}

/** Documentation-style reference links for published / locked metadata views. */
export function AuthoritativeLinkReadOnly({
  definitions,
  emptyLabel = REFERENCE_LINKS_EMPTY,
  compact,
}: AuthoritativeLinkReadOnlyProps) {
  const filled = definitions.filter(linkHasContent)

  if (filled.length === 0) {
    return <p className="text-xs text-[#9898a7] leading-snug">{emptyLabel}</p>
  }

  return (
    <GovernanceDocList>
      {filled.map(def => (
        <AuthoritativeLinkReadOnlyRow key={def.id} def={def} compact={compact} />
      ))}
    </GovernanceDocList>
  )
}
