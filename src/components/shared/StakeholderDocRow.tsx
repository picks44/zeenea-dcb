import { Stakeholder } from '@/types/odcs'
import { GovernanceDocRow } from '@/components/shared/GovernanceDocRow'

function buildMetaLine(role: string, email: string, team: string, notes: string): string {
  const parts = [role.trim(), [email.trim(), team.trim()].filter(Boolean).join(' · '), notes.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '-'
}

export function StakeholderDocRow({
  stakeholder,
  compact,
}: {
  stakeholder: Stakeholder
  compact?: boolean
}) {
  const { name, role, email, team, notes } = stakeholder
  const displayName = name.trim() || '-'

  if (compact) {
    return (
      <GovernanceDocRow
        compact
        primary={displayName}
        metaLine={buildMetaLine(role, email, team, notes)}
      />
    )
  }

  const contact = [email.trim(), team.trim()].filter(Boolean).join(' · ')
  const tertiary = [contact, notes.trim()].filter(Boolean).join(' · ') || '-'

  return (
    <GovernanceDocRow
      primary={displayName}
      secondary={role.trim() || '-'}
      tertiary={tertiary}
    />
  )
}
