import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stakeholder } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import {
  governanceTableHeadClass,
  governanceTableHeadRowClass,
  governanceTableRowClass,
  governanceTableShellClass,
  GovernanceSectionHeader,
} from '@/components/shared/GovernanceSectionHeader'
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

const STAKEHOLDER_GRID =
  'grid grid-cols-[minmax(0,1.05fr)_minmax(100px,auto)_minmax(0,1.45fr)_28px] gap-x-3 gap-y-0 items-center'

const CONTACT_LABEL_CLASS = 'text-[10px] text-[#9898a7] shrink-0 w-[3.25rem]'
const CONTACT_VALUE_CLASS = 'text-xs text-[#656574] truncate min-w-0'
const CONTACT_EMPTY_CLASS = 'text-xs text-[#9898a7]'

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
    <div className={cn(governanceTableShellClass, 'p-4')}>
      <h3 className="text-sm font-semibold text-[#12131f] mb-3">Add stakeholder</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-[#33333d]">Full name <span className="text-rose-400">*</span></Label>
          <Input
            autoFocus
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#33333d]">Governance role</Label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="flex h-8 w-full rounded border border-[#d3d3e5] bg-white px-2 text-sm hover:border-[#9898a7] focus-visible:outline-none focus-visible:border-2 focus-visible:border-[#0550dc]"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#33333d]">Email</Label>
          <Input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            type="email"
            placeholder="jane@company.com"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#33333d]">Team</Label>
          <Input
            value={form.team}
            onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
            placeholder="Data Platform"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e4e4f0]">
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

function StakeholderContact({ email, team }: { email: string; team: string }) {
  const hasEmail = Boolean(email.trim())
  const hasTeam = Boolean(team.trim())

  return (
    <div className="min-w-0 flex flex-col gap-0.5">
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className={CONTACT_LABEL_CLASS}>Email</span>
        <span
          className={cn(hasEmail ? CONTACT_VALUE_CLASS : CONTACT_EMPTY_CLASS)}
          title={hasEmail ? email : undefined}
        >
          {hasEmail ? email : '—'}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className={CONTACT_LABEL_CLASS}>Team</span>
        <span
          className={cn(hasTeam ? CONTACT_VALUE_CLASS : CONTACT_EMPTY_CLASS)}
          title={hasTeam ? team : undefined}
        >
          {hasTeam ? team : '—'}
        </span>
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

  const addAction = !isLocked && stakeholders.length > 0 && !showForm ? (
    <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="gap-1.5">
      <Plus className="h-3.5 w-3.5" />
      Add stakeholder
    </Button>
  ) : undefined

  return (
    <div className="max-w-[720px] w-full">
      <GovernanceSectionHeader
        title="Stakeholders"
        description={<WorkflowMetadataNote pill="not-in-odcs">{STAKEHOLDERS_INTRO}</WorkflowMetadataNote>}
        action={addAction}
      />

      <div className="space-y-3">
        {showForm && !isLocked && (
          <AddStakeholderForm onAdd={addStakeholder} onCancel={() => setShowForm(false)} />
        )}

        {stakeholders.length > 0 ? (
          <div className={governanceTableShellClass}>
            <div className={cn(STAKEHOLDER_GRID, governanceTableHeadRowClass, 'px-3')}>
              <span className={governanceTableHeadClass}>Name</span>
              <span className={governanceTableHeadClass}>Role</span>
              <span className={governanceTableHeadClass}>Contact</span>
              <span />
            </div>

            <div className="divide-y divide-[#e4e4f0]">
              {stakeholders.map(s => (
                <div key={s.id} className={cn(STAKEHOLDER_GRID, governanceTableRowClass, 'group')}>
                  <span className="text-sm font-medium text-[#12131f] truncate" title={s.name}>
                    {s.name}
                  </span>
                  <span
                    className={cn(
                      'inline-flex w-fit max-w-full text-[10px] px-1.5 py-0.5 rounded font-medium truncate',
                      ROLE_COLORS[s.role] || 'bg-[#f5f5fa] text-[#33333d]',
                    )}
                    title={s.role}
                  >
                    {s.role}
                  </span>
                  <StakeholderContact email={s.email} team={s.team} />
                  {!isLocked ? (
                    <button
                      type="button"
                      onClick={() => removeStakeholder(s.id)}
                      className="h-7 w-7 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
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
