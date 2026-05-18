import { useState } from 'react'
import { Plus, Trash2, Users, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stakeholder } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { WorkflowMetadataNote } from '@/components/shared/WorkflowMetadataPill'
import {
  STAKEHOLDERS_EMPTY_BODY,
  STAKEHOLDERS_EMPTY_CTA,
  STAKEHOLDERS_EMPTY_TITLE,
  STAKEHOLDERS_INTRO,
} from '@/lib/uxCopy'
import { cn } from '@/lib/utils'

interface StakeholdersSectionProps {
  stakeholders: Stakeholder[]
  onChange: (stakeholders: Stakeholder[]) => void
  isLocked: boolean
}

const ROLES = [
  'Data Owner', 'Data Steward', 'Data Consumer', 'Technical Lead',
  'Product Manager', 'Business Analyst', 'Compliance Officer', 'Other',
]

const ROLE_COLORS: Record<string, string> = {
  'Data Owner': 'bg-[#d0e8fd] text-[#0550dc]',
  'Data Steward': 'bg-[#d0e8fd] text-[#0550dc]',
  'Data Consumer': 'bg-[#cfeafd] text-[#00699f]',
  'Technical Lead': 'bg-[#d3efcd] text-[#047800]',
  'Product Manager': 'bg-[#ffebce] text-[#d27b00]',
  'Business Analyst': 'bg-orange-100 text-orange-700',
  'Compliance Officer': 'bg-[#ffdacf] text-[#c12c11]',
}

const ROLE_INITIALS_COLORS = [
  'bg-[#0550dc]', 'bg-violet-500', 'bg-[#f0ffec]0',
  'bg-[#fff8ec]0', 'bg-[#fff2ee]0', 'bg-[#ecf6ff]0',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function AddStakeholderForm({
  onAdd,
  onCancel,
}: {
  onAdd: (s: Stakeholder) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    role: 'Data Consumer',
    email: '',
    team: '',
  })

  const isValid = form.name.trim() !== ''

  return (
    <div className="bg-white rounded-xl border border-[#d3d3e5] p-4">
      <h3 className="text-sm font-semibold text-[#12131f] mb-3">Add stakeholder</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-[#33333d]">Full name <span className="text-rose-400">*</span></Label>
          <Input
            autoFocus
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#33333d]">Role</Label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="flex h-9 w-full rounded border border-[#d3d3e5] bg-white px-2 py-2 text-sm tracking-[0.2px] hover:border-[#9898a7] focus-visible:outline-none focus-visible:border-2 focus-visible:border-[#0550dc]"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#33333d]">Email</Label>
          <Input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            type="email"
            placeholder="jane@company.com"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#33333d]">Team</Label>
          <Input
            value={form.team}
            onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
            placeholder="Data Platform"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e4e4f0]">
        <Button
          size="sm"
          onClick={() => {
            if (!isValid) return
            onAdd({
              id: generateId(),
              name: form.name.trim(),
              role: form.role,
              email: form.email.trim(),
              team: form.team.trim(),
            })
            setForm({ name: '', role: 'Data Consumer', email: '', team: '' })
          }}
          disabled={!isValid}
        >
          Add stakeholder
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export function StakeholdersSection({ stakeholders, onChange, isLocked }: StakeholdersSectionProps) {
  const [showForm, setShowForm] = useState(false)

  const removeStakeholder = (id: string) => {
    onChange(stakeholders.filter(s => s.id !== id))
  }

  const addStakeholder = (s: Stakeholder) => {
    onChange([...stakeholders, s])
    setShowForm(false)
  }

  return (
    <div className="max-w-[720px] w-full">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#12131f]">Stakeholders</h2>
            <p className="text-[#3f3f4a] text-xs mt-0.5 leading-relaxed">
              <WorkflowMetadataNote pill="not-in-odcs">{STAKEHOLDERS_INTRO}</WorkflowMetadataNote>
            </p>
          </div>
          {!isLocked && stakeholders.length > 0 && !showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="gap-1.5 flex-shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Add stakeholder
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {showForm && !isLocked && (
          <AddStakeholderForm onAdd={addStakeholder} onCancel={() => setShowForm(false)} />
        )}

        {stakeholders.length > 0 ? (
          <div className="grid gap-2">
            {stakeholders.map((s, i) => (
              <div
                key={s.id}
                className="bg-white rounded-lg border border-[#d3d3e5] px-3 py-2.5 flex items-center gap-3 group"
              >
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                  ROLE_INITIALS_COLORS[i % ROLE_INITIALS_COLORS.length],
                )}>
                  {s.name ? getInitials(s.name) : <Users className="h-3.5 w-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#12131f] text-sm">{s.name}</span>
                    <span className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full font-medium',
                      ROLE_COLORS[s.role] || 'bg-[#f5f5fa] text-[#33333d]',
                    )}>
                      {s.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {s.email && (
                      <span className="flex items-center gap-1 text-xs text-[#656574]">
                        <Mail className="h-3 w-3" />
                        {s.email}
                      </span>
                    )}
                    {s.team && (
                      <span className="flex items-center gap-1 text-xs text-[#656574]">
                        <Building2 className="h-3 w-3" />
                        {s.team}
                      </span>
                    )}
                  </div>
                </div>

                {!isLocked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStakeholder(s.id)}
                    className="h-8 w-8 text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <GovernanceEmptyState
            icon={Users}
            title={STAKEHOLDERS_EMPTY_TITLE}
            body={STAKEHOLDERS_EMPTY_BODY}
            ctaLabel={STAKEHOLDERS_EMPTY_CTA}
            onCta={() => setShowForm(true)}
            isLocked={isLocked}
          />
        ) : null}
      </div>
    </div>
  )
}
