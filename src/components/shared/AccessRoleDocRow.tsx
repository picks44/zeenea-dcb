import { OdcsAccessRole } from '@/types/odcs'
import { GovernanceDocRow } from '@/components/shared/GovernanceDocRow'

function formatAccess(access: string): string {
  if (access === 'read') return 'Read'
  if (access === 'write') return 'Write'
  return access.trim() || '—'
}

export function AccessRoleDocRow({ role }: { role: OdcsAccessRole }) {
  const name = role.role.trim() || '—'
  const access = formatAccess(role.access)
  const desc = (role.description ?? '').trim()
  const secondary = desc ? `${access} · ${desc}` : access

  return <GovernanceDocRow primary={name} secondary={secondary} />
}
