import { SlaProperty } from '@/types/odcs'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { GovernanceDocRow } from '@/components/shared/GovernanceDocRow'

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

function formatValue(row: SlaProperty): string {
  const value = row.value.trim() || '—'
  const unit = (row.unit ?? '').trim()
  return unit ? `${value} ${unit}` : value
}

function formatSubline(row: SlaProperty): string | undefined {
  const parts = [
    (row.element ?? '').trim(),
    (row.driver ?? '').trim(),
    (row.description ?? '').trim(),
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : undefined
}

export function SlaCompactList({ rows }: { rows: SlaProperty[] }) {
  return (
    <GovernanceDocList>
      {rows.map(row => (
        <GovernanceDocRow
          key={row.id}
          primary={slaPropertyLabel(row)}
          secondary={formatValue(row)}
          tertiary={formatSubline(row)}
        />
      ))}
    </GovernanceDocList>
  )
}
