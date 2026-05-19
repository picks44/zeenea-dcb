import { SlaProperty } from '@/types/odcs'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { DOC_COMPACT_ROW } from '@/components/shared/docViewTokens'
import { cn } from '@/lib/utils'

function formatInlineValue(row: SlaProperty): string {
  const value = row.value.trim() || '—'
  const unit = (row.unit ?? '').trim()
  const main = unit ? `${value} ${unit}` : value
  const extras = [(row.element ?? '').trim(), (row.driver ?? '').trim(), (row.description ?? '').trim()]
    .filter(Boolean)
  if (extras.length === 0) return main
  return `${main} · ${extras.join(' · ')}`
}

function slaLabel(row: SlaProperty): string {
  const el = (row.element ?? '').trim()
  return el || `Value: ${row.value}` || 'SLA'
}

function SlaInlineRow({ row, compact }: { row: SlaProperty; compact?: boolean }) {
  const label = slaLabel(row)
  const detail = formatInlineValue(row)

  return (
    <div className={cn(compact ? DOC_COMPACT_ROW : 'px-3 py-2', 'text-xs leading-snug')}>
      <span className="font-medium text-[#12131f]">{label}</span>
      <span className="text-[#656574]"> · {detail}</span>
    </div>
  )
}

export function SlaCompactList({ rows, compact }: { rows: SlaProperty[]; compact?: boolean }) {
  return (
    <GovernanceDocList>
      {rows.map(row => (
        <SlaInlineRow key={row.id} row={row} compact={compact} />
      ))}
    </GovernanceDocList>
  )
}
