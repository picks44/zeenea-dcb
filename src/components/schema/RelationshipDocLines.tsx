import { cn } from '@/lib/utils'

interface RelationshipDocLinesProps {
  source: string
  target: string
  compact?: boolean
  onNavigate?: () => void
  navigateLabel?: string
}

/** Mono source → target lines for schema relationship documentation. */
export function RelationshipDocLines({
  source,
  target,
  compact,
  onNavigate,
  navigateLabel,
}: RelationshipDocLinesProps) {
  const textSize = compact ? 'text-[9px]' : 'text-[10px]'

  return (
    <div
      className={cn('font-mono leading-relaxed', compact ? 'space-y-0.5' : 'space-y-1')}
      aria-label={navigateLabel}
    >
      <p className={cn(textSize, 'text-[#2a2a30] truncate')} title={source}>
        {source}
      </p>
      <p className={cn('text-[#9898a7] select-none', compact ? 'text-[8px]' : 'text-[9px]')} aria-hidden>
        →
      </p>
      {onNavigate ? (
        <button
          type="button"
          onClick={onNavigate}
          title={navigateLabel ?? `Go to ${target}`}
          className={cn(
            textSize,
            'block max-w-full truncate text-left text-[#2a2a30]',
            'rounded px-0.5 -mx-0.5',
            'cursor-pointer',
            'hover:text-[#0550dc] hover:bg-[#f0f4ff]/80',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0550dc]',
          )}
        >
          {target}
        </button>
      ) : (
        <p className={cn(textSize, 'text-[#2a2a30] truncate')} title={target}>
          {target}
        </p>
      )}
    </div>
  )
}
