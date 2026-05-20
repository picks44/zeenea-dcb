import type { CustomProperty } from '@/types/odcsShared'
import { GovernanceDocRow } from '@/components/shared/GovernanceDocRow'

export function CustomPropertyDocRow({
  property,
  compact,
}: {
  property: CustomProperty
  compact?: boolean
}) {
  const name = property.property.trim() || '-'
  const value = property.value.trim() || '-'
  const desc = (property.description ?? '').trim()

  return (
    <GovernanceDocRow
      primary={<span className="font-mono">{name}</span>}
      secondary={value}
      tertiary={desc || undefined}
      compact={compact}
    />
  )
}
