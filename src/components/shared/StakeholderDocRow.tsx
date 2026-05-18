import { Stakeholder } from '@/types/odcs'
import { GovernanceDocRow } from '@/components/shared/GovernanceDocRow'

function formatContact(email: string, team: string, notes: string): string {
  const contact = [email.trim(), team.trim()].filter(Boolean).join(' · ')
  const parts = [contact, notes.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '—'
}

export function StakeholderDocRow({ stakeholder }: { stakeholder: Stakeholder }) {
  const { name, role, email, team, notes } = stakeholder
  const displayName = name.trim() || '—'

  return (
    <GovernanceDocRow
      primary={displayName}
      secondary={role.trim() || '—'}
      tertiary={formatContact(email, team, notes)}
    />
  )
}
