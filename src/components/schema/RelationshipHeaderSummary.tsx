import { Link2 } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import type { RelationshipHeaderSummary as Summary } from '@/lib/schemaRelationshipUx'

interface RelationshipHeaderSummaryProps {
  summary: Summary
}

export function RelationshipHeaderSummaryBadge({ summary }: RelationshipHeaderSummaryProps) {
  const badge = (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#656574] flex-shrink-0">
      <Link2 className="h-3 w-3 text-[#9898a7] flex-shrink-0" aria-hidden />
      <span>{summary.label}</span>
    </span>
  )

  if (summary.detailLines.length === 0) return badge

  return (
    <Tooltip
      content={
        <span className="block whitespace-pre-line leading-snug">
          {summary.detailLines.join('\n')}
        </span>
      }
      delayDuration={400}
      side="bottom"
    >
      {badge}
    </Tooltip>
  )
}
