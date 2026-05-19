import { X } from 'lucide-react'
import type { TableRelationship } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import {
  isCompositeTableRelationship,
  isLegacySingleColumnBelongsTo,
  isTableRelationshipNotPublished,
} from '@/lib/relationshipExport'
import { formatRelationshipDisplayLines } from '@/lib/schemaRelationshipDisplay'
import { RELATIONSHIP_COMPOSITE_HELPER, RELATIONSHIP_FK_HELPER, RELATIONSHIP_SINGLE_FK_HINT } from '@/lib/uxCopy'
import { RelationshipDocLines } from '@/components/schema/RelationshipDocLines'
import { useSchemaNavigation } from '@/components/schema/SchemaNavigationContext'

const TYPE_LABELS: Record<string, { notation: string; name: string }> = {
  composite_foreign_key: { notation: 'FK*', name: 'Composite FK' },
  many_to_many: { notation: 'N ↔ N', name: 'Many-to-many' },
  belongs_to: { notation: 'N → 1', name: 'Belongs to' },
  has_many: { notation: '1 → N', name: 'Has many' },
  has_one: { notation: '1 → 1', name: 'Has one' },
}

interface TableRelationshipRowProps {
  rel: TableRelationship
  sourceTable: string
  onRemove?: () => void
  compact?: boolean
}

export function TableRelationshipRow({ rel, sourceTable, onRemove, compact }: TableRelationshipRowProps) {
  const nav = useSchemaNavigation()
  const meta = TYPE_LABELS[rel.type] ?? { notation: '?', name: rel.type }
  const notPublished = isTableRelationshipNotPublished(rel)
  const legacyBelongs = isLegacySingleColumnBelongsTo(rel)
  const composite = isCompositeTableRelationship(rel)
  const lines = formatRelationshipDisplayLines(rel, sourceTable)

  const navigateToTarget = () => {
    if (!lines) return
    nav?.navigateTo({
      table: lines.targetTable,
      column: lines.targetColumn,
    })
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 bg-neutral-25 shadow-sm',
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
        onRemove && 'pr-9 relative',
      )}
    >
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2.5 right-2 h-6 w-6 flex items-center justify-center rounded text-neutral-300 hover:text-red-700 hover:bg-red-25 transition-colors"
          aria-label="Remove relationship"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={cn('flex items-center gap-2 flex-wrap', compact ? 'mb-1' : 'mb-1.5')}>
        <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-25 border border-blue-100 px-1.5 py-0.5 rounded tabular-nums">
          {meta.notation}
        </span>
        <span className="text-[11px] font-semibold text-neutral-700">{meta.name}</span>
        {notPublished && <WorkflowMetadataPill variant="not-published" />}
      </div>

      {lines ? (
        <RelationshipDocLines
          source={lines.source}
          target={lines.target}
          compact={compact}
          onNavigate={nav ? navigateToTarget : undefined}
          navigateLabel={`Go to table ${lines.targetTable}`}
        />
      ) : (
        <p className="text-[11px] text-neutral-400">→ {rel.toTable}</p>
      )}

      {legacyBelongs && (
        <p className="text-[10px] text-neutral-400 mt-1.5 leading-snug">{RELATIONSHIP_SINGLE_FK_HINT}</p>
      )}
      {notPublished && !legacyBelongs && (
        <p className="text-[10px] text-neutral-400 mt-1.5 leading-snug">
          {composite ? RELATIONSHIP_COMPOSITE_HELPER : RELATIONSHIP_FK_HELPER}
        </p>
      )}
    </div>
  )
}
