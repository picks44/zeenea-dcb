import { Link2 } from 'lucide-react'
import type { ColumnForeignKey } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'

interface ColumnFkIndicatorProps {
  foreignKey: ColumnForeignKey | undefined
  compact?: boolean
  className?: string
}

/** Inline field-level FK target for schema table rows. */
export function ColumnFkIndicator({ foreignKey, compact, className }: ColumnFkIndicatorProps) {
  if (!isColumnForeignKeyComplete(foreignKey)) return null

  const target = `${foreignKey!.toTable}.${foreignKey!.toColumn}`

  return (
    <p
      className={cn(
        'flex items-center gap-1 min-w-0 text-[#656574] font-mono leading-tight',
        compact ? 'text-[9px] mt-0' : 'text-[10px] mt-0.5',
        className,
      )}
      title={`Foreign key → ${target}`}
    >
      <Link2 className={cn('flex-shrink-0 text-[#9898a7]', compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      <span className="flex-shrink-0 text-[#9898a7] font-sans font-normal">FK →</span>
      <span className="truncate text-[#3f3f4a]">{target}</span>
    </p>
  )
}
