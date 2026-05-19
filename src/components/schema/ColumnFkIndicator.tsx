import type { ColumnForeignKey } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'
import { useSchemaNavigation } from '@/components/schema/SchemaNavigationContext'

interface ColumnFkIndicatorProps {
  foreignKey: ColumnForeignKey | undefined
  compact?: boolean
  className?: string
}

const tokenClass = (compact?: boolean) =>
  cn(
    'inline-flex items-center gap-1 max-w-full min-w-0',
    'rounded border border-blue-100 bg-blue-25',
    'px-1 py-px font-mono leading-tight',
    compact ? 'text-[9px] mt-0.5' : 'text-[10px] mt-0.5',
  )

/** Compact FK relationship token for schema field rows. */
export function ColumnFkIndicator({ foreignKey, compact, className }: ColumnFkIndicatorProps) {
  const nav = useSchemaNavigation()

  if (!isColumnForeignKeyComplete(foreignKey)) return null

  const fk = foreignKey!
  const target = `${fk.toTable}.${fk.toColumn}`
  const title = nav ? `Go to ${target}` : target

  const content = (
    <>
      <span className="flex-shrink-0 font-sans font-semibold uppercase tracking-wide text-blue-700 text-[8px]">
        FK
      </span>
      <span className="truncate text-neutral-700">{target}</span>
    </>
  )

  if (nav) {
    return (
      <button
        type="button"
        onClick={() => nav.navigateTo({ table: fk.toTable, column: fk.toColumn })}
        title={title}
        className={cn(
          tokenClass(compact),
          'cursor-pointer transition-colors',
          'hover:bg-blue-50 hover:border-blue-700/50',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <span title={title} className={cn(tokenClass(compact), className)}>
      {content}
    </span>
  )
}
