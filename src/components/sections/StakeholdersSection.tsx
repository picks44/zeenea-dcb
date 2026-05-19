import { Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Stakeholder } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { StakeholderDocRow } from '@/components/shared/StakeholderDocRow'
import { GovernanceDeleteButton } from '@/components/shared/GovernanceDeleteButton'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { GovernanceTableFooter } from '@/components/shared/GovernanceTableFooter'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import {
  governanceTableHeadClass,
  governanceTableHeadRowClass,
  governanceTableRowClass,
  governanceTableShellClass,
} from '@/components/shared/GovernanceSectionHeader'
import {
  SECTION_GOVERNANCE_CONTACTS,
  STAKEHOLDERS_EMPTY_BODY,
  STAKEHOLDERS_EMPTY_CTA,
  STAKEHOLDERS_EMPTY_TITLE,
  STAKEHOLDERS_INTRO,
} from '@/lib/uxCopy'
import { READINESS_FIELD_STAKEHOLDERS_ROOT } from '@/lib/uxCopy'
import { useReadinessField, useSectionGuidanceRoot } from '@/components/readiness/ReadinessNavigationContext'

interface StakeholdersSectionProps {
  stakeholders: Stakeholder[]
  onChange: (stakeholders: Stakeholder[]) => void
  isLocked: boolean
  docCompact?: boolean
}

const GOVERNANCE_ROLES = [
  'Data Owner',
  'Data Steward',
  'Data Consumer',
  'Technical Lead',
  'Product Manager',
  'Business Analyst',
  'Compliance Officer',
  'Other',
] as const

const STAKEHOLDER_GRID =
  'grid grid-cols-[minmax(0,1fr)_minmax(128px,auto)_minmax(0,1.05fr)_minmax(0,1fr)_32px] gap-x-3 gap-y-0 items-center'

const INPUT_CLASS = 'h-8 text-xs'

function makeStakeholder(): Stakeholder {
  return {
    id: generateId(),
    name: '',
    role: 'Data Consumer',
    email: '',
    team: '',
    notes: '',
  }
}

export function StakeholdersSection({ stakeholders, onChange, isLocked, docCompact }: StakeholdersSectionProps) {
  const { setRef: sectionRootRef } = useSectionGuidanceRoot('stakeholders')
  const contactCount = stakeholders.filter(s => Boolean(s.name?.trim())).length
  const { setRef: contactsAnchorRef } = useReadinessField(
    READINESS_FIELD_STAKEHOLDERS_ROOT,
    contactCount === 0,
    false,
  )

  const update = (id: string, patch: Partial<Stakeholder>) =>
    onChange(stakeholders.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(stakeholders.filter(s => s.id !== id))

  return (
    <div ref={sectionRootRef} className="max-w-[720px] w-full">
      <div ref={contactsAnchorRef}>
        <ContractSectionHeader
          title={SECTION_GOVERNANCE_CONTACTS}
          description={STAKEHOLDERS_INTRO}
          compact={docCompact && isLocked}
          flashTitle
        />

      {stakeholders.length === 0 ? (
        <GovernanceEmptyState
          icon={Users}
          title={STAKEHOLDERS_EMPTY_TITLE}
          body={STAKEHOLDERS_EMPTY_BODY}
          ctaLabel={STAKEHOLDERS_EMPTY_CTA}
          onCta={() => onChange([makeStakeholder()])}
          isLocked={isLocked}
        />
      ) : isLocked ? (
        <GovernanceDocList>
          {stakeholders.map(s => (
            <StakeholderDocRow key={s.id} stakeholder={s} compact={docCompact} />
          ))}
        </GovernanceDocList>
      ) : (
        <div className={`${governanceTableShellClass} overflow-x-auto`}>
          <div className={cn(STAKEHOLDER_GRID, governanceTableHeadRowClass, 'px-3')}>
            <span className={governanceTableHeadClass}>Name</span>
            <span className={governanceTableHeadClass}>Role</span>
            <span className={governanceTableHeadClass}>Contact</span>
            <span className={governanceTableHeadClass}>Notes</span>
            <span />
          </div>

          <div className="divide-y divide-neutral-100">
            {stakeholders.map(s => (
              <div key={s.id} className={cn(STAKEHOLDER_GRID, governanceTableRowClass)}>
                <Input
                  value={s.name}
                  onChange={e => update(s.id, { name: e.target.value })}
                  placeholder="Full name"
                  className={INPUT_CLASS}
                />
                <Select
                  value={s.role}
                  onValueChange={v => v && update(s.id, { role: v })}
                >
                  <SelectTrigger className={cn(INPUT_CLASS, 'w-full')} aria-label="Governance role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNANCE_ROLES.map(r => (
                      <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-w-0 grid grid-cols-2 gap-1">
                  <Input
                    value={s.email}
                    onChange={e => update(s.id, { email: e.target.value })}
                    type="email"
                    placeholder="Email"
                    className={INPUT_CLASS}
                  />
                  <Input
                    value={s.team}
                    onChange={e => update(s.id, { team: e.target.value })}
                    placeholder="Team / org"
                    className={INPUT_CLASS}
                  />
                </div>
                <Textarea
                  value={s.notes}
                  onChange={e => update(s.id, { notes: e.target.value })}
                  placeholder="Optional note"
                  rows={1}
                  className="text-xs min-h-[32px] resize-none py-1.5"
                />
                <GovernanceDeleteButton
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.name.trim() || 'contact'}`}
                />
              </div>
            ))}
          </div>

          <GovernanceTableFooter
            label={STAKEHOLDERS_EMPTY_CTA}
            onAdd={() => onChange([...stakeholders, makeStakeholder()])}
          />
        </div>
      )}
      </div>
    </div>
  )
}
