import type { ColumnForeignKey } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'
import { useSchemaNavigation } from '@/components/schema/SchemaNavigationContext'

interface ColumnFkIndicatorProps {
  foreignKey: ColumnForeignKey | undefined
  compact?: boolean
  className?: string
}

/** Compact FK relationship token for schema field rows. */
export function ColumnFkIndicator({ foreignKey, compact, className }: ColumnFkIndicatorProps) {
  const nav = useSchemaNavigation()

  if (!isColumnForeignKeyComplete(foreignKey)) return null

  const fk = foreignKey!
  const target = `${fk.toTable}.${fk.toColumn}`

  const handleNavigate = () => {
    nav?.navigateTo({ table: fk.toTable, column: fk.toColumn })
  }

  return (
    <button
      type="button"
      onClick={handleNavigate}
      title={`Go to ${target}`}
      className={cn(
        'inline-flex items-center gap-1 max-w-full min-w-0',
        'rounded border border-[#b8d0fb] bg-[#f0f4ff]',
        'px-1 py-px',
        'font-mono leading-tight',
        'cursor-pointer transition-colors',
        'hover:bg-[#e8f0ff] hover:border-[#0550dc]/50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0550dc]',
        compact ? 'text-[9px] mt-0.5' : 'text-[10px] mt-0.5',
        className,
      )}
    >
      <span className="flex-shrink-0 font-sans font-semibold uppercase tracking-wide text-[#0550dc] text-[8px]">
        FK
      </span>
      <span className="truncate text-[#2a2a30]">{target}</span>
    </button>
  )
}
