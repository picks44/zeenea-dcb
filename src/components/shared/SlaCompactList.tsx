import { SlaProperty } from '@/types/odcs'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { DOC_COMPACT_ROW } from '@/components/shared/docViewTokens'
import { cn } from '@/lib/utils'

const PROPERTY_PRESETS = [
  'latency',
  'retention',
  'frequency',
  'generalAvailability',
  'endOfSupport',
  'endOfLife',
  'timeOfAvailability',
  'custom',
] as const

const SLA_PROPERTY_LABELS: Record<(typeof PROPERTY_PRESETS)[number], string> = {
  latency: 'Latency',
  retention: 'Retention',
  frequency: 'Frequency',
  generalAvailability: 'Availability',
  endOfSupport: 'End of support',
  endOfLife: 'End of life',
  timeOfAvailability: 'Time of availability',
  custom: 'Custom…',
}

function slaPropertyLabel(row: SlaProperty): string {
  const isCustom = !PROPERTY_PRESETS.slice(0, -1).includes(row.property as (typeof PROPERTY_PRESETS)[number])
  if (isCustom && row.property.trim()) return row.property.trim()
  const preset = isCustom ? 'custom' : row.property
  return SLA_PROPERTY_LABELS[preset as (typeof PROPERTY_PRESETS)[number]] ?? row.property
}

function formatInlineValue(row: SlaProperty): string {
  const value = row.value.trim() || '—'
  const unit = (row.unit ?? '').trim()
  const main = unit ? `${value} ${unit}` : value
  const extras = [(row.element ?? '').trim(), (row.driver ?? '').trim(), (row.description ?? '').trim()]
    .filter(Boolean)
  if (extras.length === 0) return main
  return `${main} · ${extras.join(' · ')}`
}

function SlaInlineRow({ row, compact }: { row: SlaProperty; compact?: boolean }) {
  const label = slaPropertyLabel(row)
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
