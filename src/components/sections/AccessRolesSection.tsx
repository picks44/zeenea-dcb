import { Plus, Trash2, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OdcsAccessRole } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
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

function makeRole(): OdcsAccessRole {
  return { id: generateId(), role: '', access: 'read', description: '' }
}

export function AccessRolesSection({ roles, onChange, isLocked }: AccessRolesSectionProps) {
  const update = (id: string, patch: Partial<OdcsAccessRole>) =>
    onChange(roles.map(r => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: string) => onChange(roles.filter(r => r.id !== id))

  return (
    <div className="max-w-[720px] w-full">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#12131f]">Data access roles</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5 leading-relaxed">
          {DATA_ACCESS_ROLES_INTRO}
        </p>
      </div>

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
        <div className="border border-[#d3d3e5] rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[1fr_100px_1fr_36px] gap-0 border-b border-[#e4e4f0] bg-[#fbfbff]/80 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574]">Role</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574]">Access</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574]">Description</span>
            <span />
          </div>

          <div className="divide-y divide-[#e4e4f0]">
            {roles.map(r => (
              <div key={r.id} className="grid grid-cols-[1fr_100px_1fr_36px] gap-2 items-start px-3 py-2.5">
                <Input
                  value={r.role}
                  onChange={e => update(r.id, { role: e.target.value })}
                  placeholder="e.g. analytics_user"
                  disabled={isLocked}
                  className="h-8 text-xs"
                />
                <Select
                  value={r.access}
                  onValueChange={v => v && update(r.id, { access: v as 'read' | 'write' })}
                  disabled={isLocked}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read" className="text-xs">Read</SelectItem>
                    <SelectItem value="write" className="text-xs">Write</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={r.description ?? ''}
                  onChange={e => update(r.id, { description: e.target.value })}
                  placeholder="Optional"
                  disabled={isLocked}
                  rows={1}
                  className="text-xs min-h-[32px] resize-none py-1.5"
                />
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="h-8 w-8 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isLocked && (
            <div className="px-3 py-2 border-t border-[#e4e4f0] bg-[#fbfbff]/40">
              <button
                type="button"
                onClick={() => onChange([...roles, makeRole()])}
                className="flex items-center gap-1.5 text-xs text-[#656574] hover:text-[#0550dc] font-medium transition-colors"
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
