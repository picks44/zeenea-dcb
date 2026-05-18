import { cn } from '@/lib/utils'

interface RelationshipPreviewBlockProps {
  title?: string
  sourceLine: string
  targetLine: string
  compact?: boolean
  className?: string
}

/** Compact documentation-style relationship preview (not a form control). */
export function RelationshipPreviewBlock({
  title = 'Relationship preview',
  sourceLine,
  targetLine,
  compact,
  className,
}: RelationshipPreviewBlockProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#e4e4f0] bg-[#fbfbff] px-2.5 py-2',
        compact && 'px-2 py-1.5',
        className,
      )}
    >
      <p className="text-[10px] font-medium text-[#656574] mb-1">{title}</p>
      <div className="font-mono text-[11px] text-[#33333d] leading-snug space-y-0.5">
        <p className="truncate" title={sourceLine}>{sourceLine}</p>
        <p className="text-[#9898a7]">→</p>
        <p className="truncate" title={targetLine}>{targetLine}</p>
      </div>
    </div>
  )
}
