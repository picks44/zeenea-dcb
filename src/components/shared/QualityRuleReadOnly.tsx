import type { QualityRule } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { DOC_COMPACT_ROW } from '@/components/shared/docViewTokens'

function ruleHasContent(rule: QualityRule): boolean {
  return Boolean(rule.name?.trim() || rule.description.trim())
}

function QualityRuleReadOnlyRow({ rule, compact }: { rule: QualityRule; compact?: boolean }) {
  const name = rule.name?.trim() ?? ''
  const desc = rule.description.trim()

  if (name) {
    return (
      <div className={cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2.5')}>
        <p className="text-xs font-medium text-[#12131f] leading-snug">{name}</p>
        {desc ? (
          <p className="text-[11px] text-[#656574] mt-0.5 leading-relaxed whitespace-pre-wrap">{desc}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2.5')}>
      <p className="text-xs text-[#33333d] leading-relaxed whitespace-pre-wrap">{desc}</p>
    </div>
  )
}

interface QualityRuleReadOnlyProps {
  rules: QualityRule[]
  emptyLabel?: string
  compact?: boolean
}

/** Documentation-style quality rules list for published / locked metadata views. */
export function QualityRuleReadOnly({
  rules,
  emptyLabel = 'No quality rules defined.',
  compact,
}: QualityRuleReadOnlyProps) {
  const filled = rules.filter(ruleHasContent)

  if (filled.length === 0) {
    return <p className="text-xs text-[#9898a7] leading-snug">{emptyLabel}</p>
  }

  return (
    <GovernanceDocList>
      {filled.map(rule => (
        <QualityRuleReadOnlyRow key={rule.id} rule={rule} compact={compact} />
      ))}
    </GovernanceDocList>
  )
}
