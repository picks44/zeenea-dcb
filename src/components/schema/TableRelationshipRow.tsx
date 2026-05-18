import { X } from 'lucide-react'
import type { TableRelationship } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import {
  isCompositeTableRelationship,
  isLegacySingleColumnBelongsTo,
  isTableRelationshipNotPublished,
} from '@/lib/relationshipExport'
import { RELATIONSHIP_COMPOSITE_HELPER, RELATIONSHIP_FK_HELPER, RELATIONSHIP_SINGLE_FK_HINT } from '@/lib/uxCopy'

const TYPE_LABELS: Record<string, { notation: string; name: string }> = {
  composite_foreign_key: { notation: 'FK*', name: 'Composite FK' },
  many_to_many: { notation: 'N ↔ N', name: 'Many-to-many' },
  belongs_to: { notation: 'N → 1', name: 'Belongs to' },
  has_many: { notation: '1 → N', name: 'Has many' },
  has_one: { notation: '1 → 1', name: 'Has one' },
}

function relationshipDocLines(
  rel: TableRelationship,
  sourceTable: string,
): { source: string; target: string } | null {
  if (isCompositeTableRelationship(rel)) {
    const from = (rel.fromColumns ?? []).join(', ')
    const to = (rel.toColumns ?? []).map(c => `${rel.toTable}.${c}`).join(', ')
    if (!from || !to) return null
    return {
      source: `(${from})`,
      target: `${rel.toTable}(${rel.toColumns?.join(', ') ?? ''})`,
    }
  }
  if (rel.fromColumn && rel.toColumn) {
    return {
      source: `${sourceTable}.${rel.fromColumn}`,
      target: `${rel.toTable}.${rel.toColumn}`,
    }
  }
  if (rel.toTable) {
    return { source: sourceTable, target: rel.toTable }
  }
  return null
}

interface TableRelationshipRowProps {
  rel: TableRelationship
  sourceTable: string
  onRemove?: () => void
  compact?: boolean
}

export function TableRelationshipRow({ rel, sourceTable, onRemove, compact }: TableRelationshipRowProps) {
  const meta = TYPE_LABELS[rel.type] ?? { notation: '?', name: rel.type }
  const notPublished = isTableRelationshipNotPublished(rel)
  const legacyBelongs = isLegacySingleColumnBelongsTo(rel)
  const composite = isCompositeTableRelationship(rel)
  const lines = relationshipDocLines(rel, sourceTable)

  return (
    <div
      className={cn(
        'rounded-lg border border-[#e4e4f0] bg-white px-2.5 py-2',
        compact && 'px-2 py-1.5',
        onRemove && 'pr-8 relative',
      )}
    >
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] transition-colors"
          aria-label="Remove relationship"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] font-mono font-semibold text-[#0550dc] bg-[#f0f4ff] border border-[#b8d0fb] px-1.5 py-0.5 rounded tabular-nums">
          {meta.notation}
        </span>
        <span className="text-[11px] font-medium text-[#33333d]">{meta.name}</span>
        {notPublished && <WorkflowMetadataPill variant="not-published" />}
      </div>

      {lines ? (
        <div className="font-mono text-[10px] text-[#3f3f4a] leading-relaxed space-y-0.5 pl-0.5">
          <p className="truncate" title={lines.source}>{lines.source}</p>
          <p className="text-[#9898a7]">→</p>
          <p className="truncate" title={lines.target}>{lines.target}</p>
        </div>
      ) : (
        <p className="text-[11px] text-[#656574]">→ {rel.toTable}</p>
      )}

      {legacyBelongs && (
        <p className="text-[10px] text-[#656574] mt-1.5 leading-snug">{RELATIONSHIP_SINGLE_FK_HINT}</p>
      )}
      {notPublished && !legacyBelongs && (
        <p className="text-[10px] text-[#656574] mt-1.5 leading-snug">
          {composite ? RELATIONSHIP_COMPOSITE_HELPER : RELATIONSHIP_FK_HELPER}
        </p>
      )}
    </div>
  )
}
