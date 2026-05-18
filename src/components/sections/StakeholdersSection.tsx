import { useState } from 'react'
import { Plus, Trash2, Users, Mail, Building2, Briefcase, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stakeholder } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { STAKEHOLDERS_BANNER } from '@/lib/uxCopy'
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
    <div className="bg-white rounded-xl border border-[#b8d0fb] shadow-sm p-5 ring-1 ring-indigo-100">
      <h3 className="text-sm font-semibold text-[#12131f] mb-4">Add Stakeholder</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-[#33333d]">Full Name <span className="text-rose-400">*</span></Label>
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
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#e4e4f0]">
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
          Add Stakeholder
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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#0550dc] text-sm font-medium mb-2">
          <Users className="h-4 w-4" />
          <span>Step 4 of 4</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#12131f] mb-2">Stakeholders</h1>
            <p className="text-[#3f3f4a] text-sm leading-relaxed">
              Record governance contacts for this contract. Stakeholders support collaboration and accountability in the application.
            </p>
          </div>
          {!isLocked && stakeholders.length > 0 && !showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="gap-1.5 flex-shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Add Stakeholder
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-[#e4e4f0] bg-[#fbfbff] px-3 py-2.5 mb-1">
        <Info className="h-3.5 w-3.5 text-[#656574] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#656574] leading-snug">
          {STAKEHOLDERS_BANNER}
        </p>
      </div>

      <div className="space-y-4">
        {/* Add form */}
        {showForm && !isLocked && (
          <AddStakeholderForm onAdd={addStakeholder} onCancel={() => setShowForm(false)} />
        )}

        {/* Stakeholder cards */}
        {stakeholders.length > 0 ? (
          <div className="grid gap-3">
            {stakeholders.map((s, i) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-[#d3d3e5] shadow-sm p-4 flex items-center gap-4 group"
              >
                {/* Avatar */}
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0',
                  ROLE_INITIALS_COLORS[i % ROLE_INITIALS_COLORS.length]
                )}>
                  {s.name ? getInitials(s.name) : <Users className="h-4 w-4" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#12131f] text-sm">{s.name}</span>
                    <span className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full font-medium',
                      ROLE_COLORS[s.role] || 'bg-[#f5f5fa] text-[#33333d]'
                    )}>
                      {s.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
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

                {/* Remove */}
                {!isLocked && (
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => removeStakeholder(s.id)}
                    className="text-neutral-300 hover:text-red-700 hover:bg-red-25 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : !showForm ? (
          /* Empty state */
          <div className="border-2 border-dashed border-[#d3d3e5] rounded-xl p-16 flex flex-col items-center gap-4 bg-[#fbfbff]/50">
            <div className="h-12 w-12 rounded-full bg-[#f5f5fa] flex items-center justify-center">
              <Users className="h-6 w-6 text-[#656574]" />
            </div>
            <div className="text-center">
              <p className="text-[#33333d] font-medium mb-1">No stakeholders added yet</p>
              <p className="text-[#656574] text-sm">
                Add the teams and individuals involved with this contract.
              </p>
            </div>
            {!isLocked && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add first stakeholder
              </Button>
            )}
          </div>
        ) : null}

        {/* Help box */}
        {stakeholders.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, label: 'Data Owner', desc: 'Accountable for data quality and contract' },
              { icon: Users, label: 'Data Consumer', desc: 'Teams that use this data' },
              { icon: Building2, label: 'Data Steward', desc: 'Maintains and governs the contract' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-3 bg-[#fbfbff] rounded-lg border border-[#e4e4f0]">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-[#656574]" />
                  <span className="text-xs font-semibold text-[#33333d]">{label}</span>
                </div>
                <p className="text-xs text-[#656574] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
