import { Plus, Trash2, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OdcsAccessRole } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { GovernanceReadOnlyCell } from '@/components/shared/GovernanceReadOnlyCell'
import {
  governanceTableFooterActionClass,
  governanceTableFooterClass,
  governanceTableHeadClass,
  governanceTableRowClass,
  governanceTableHeadRowClass,
  governanceTableShellClass,
  GovernanceSectionHeader,
} from '@/components/shared/GovernanceSectionHeader'
import {
  DATA_ACCESS_EMPTY_BODY,
  DATA_ACCESS_EMPTY_CTA,
  DATA_ACCESS_EMPTY_TITLE,
  DATA_ACCESS_ROLES_INTRO,
} from '@/lib/uxCopy'

interface AccessRolesSectionProps {
  roles: OdcsAccessRole[]
  onChange: (roles: OdcsAccessRole[]) => void
  isLocked: boolean
}

const ACCESS_GRID =
  'grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1.2fr)_32px] gap-x-3 gap-y-0 items-center'

const ACCESS_GRID_READONLY =
  'grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1.2fr)] gap-x-3 gap-y-0 items-center'

function makeRole(): OdcsAccessRole {
  return { id: generateId(), role: '', access: 'read', description: '' }
}

function formatAccess(access: string): string {
  if (access === 'read') return 'Read'
  if (access === 'write') return 'Write'
  return access.trim() || '—'
}

function AccessRoleReadOnlyRow({ role }: { role: OdcsAccessRole }) {
  return (
    <>
      <GovernanceReadOnlyCell value={role.role} />
      <GovernanceReadOnlyCell value={formatAccess(role.access)} />
      <GovernanceReadOnlyCell value={role.description ?? ''} />
    </>
  )
}

export function AccessRolesSection({ roles, onChange, isLocked }: AccessRolesSectionProps) {
  const update = (id: string, patch: Partial<OdcsAccessRole>) =>
    onChange(roles.map(r => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: string) => onChange(roles.filter(r => r.id !== id))

  const gridClass = isLocked ? ACCESS_GRID_READONLY : ACCESS_GRID

  return (
    <div className="max-w-[720px] w-full">
      <GovernanceSectionHeader
        title="Data access roles"
        description={DATA_ACCESS_ROLES_INTRO}
      />

      {roles.length === 0 ? (
        <GovernanceEmptyState
          icon={Shield}
          title={DATA_ACCESS_EMPTY_TITLE}
          body={DATA_ACCESS_EMPTY_BODY}
          ctaLabel={DATA_ACCESS_EMPTY_CTA}
          onCta={() => onChange([makeRole()])}
          isLocked={isLocked}
        />
      ) : (
        <div className={governanceTableShellClass}>
          <div className={cn(gridClass, governanceTableHeadRowClass, 'px-3')}>
            <span className={governanceTableHeadClass}>Role</span>
            <span className={governanceTableHeadClass}>Access</span>
            <span className={governanceTableHeadClass}>Description</span>
            {!isLocked && <span />}
          </div>

          <div className="divide-y divide-[#e4e4f0]">
            {roles.map(r => (
              <div key={r.id} className={cn(gridClass, governanceTableRowClass)}>
                {isLocked ? (
                  <AccessRoleReadOnlyRow role={r} />
                ) : (
                  <>
                    <Input
                      value={r.role}
                      onChange={e => update(r.id, { role: e.target.value })}
                      placeholder="e.g. analytics_user"
                      className="h-8 text-xs"
                    />
                    <Select
                      value={r.access}
                      onValueChange={v => v && update(r.id, { access: v as 'read' | 'write' })}
                    >
                      <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read" className="text-xs">Read</SelectItem>
                        <SelectItem value="write" className="text-xs">Write</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={r.description ?? ''}
                      onChange={e => update(r.id, { description: e.target.value })}
                      placeholder="Optional note"
                      rows={1}
                      className="text-xs min-h-[32px] resize-none py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="h-7 w-7 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded transition-colors"
                      aria-label="Remove role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {!isLocked && (
            <div className={governanceTableFooterClass}>
              <button
                type="button"
                onClick={() => onChange([...roles, makeRole()])}
                className={governanceTableFooterActionClass}
              >
                <Plus className="h-3.5 w-3.5" />
                Add role
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
