import { Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GovernanceDeleteButton } from '@/components/shared/GovernanceDeleteButton'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { GovernanceTableFooter } from '@/components/shared/GovernanceTableFooter'
import { GovernanceReadOnlyCell } from '@/components/shared/GovernanceReadOnlyCell'
import { SlaCompactList } from '@/components/shared/SlaCompactList'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import {
  governanceTableHeadClass,
  governanceTableHeadRowClass,
  governanceTableShellClass,
} from '@/components/shared/GovernanceSectionHeader'
import { cn } from '@/lib/utils'
import {
  SLA_EMPTY_BODY,
  SLA_EMPTY_CTA,
  SLA_EMPTY_TITLE,
  SLA_SECTION_INTRO,
} from '@/lib/uxCopy'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlaProperty, SlaPropertyType } from '@/types/odcs'
import { generateId } from '@/lib/utils'
import { SLA_DRIVERS, SLA_PROPERTY_LABELS, SLA_PROPERTY_TYPES, SLA_UNITS } from '@/lib/p1Constants'
import { shouldUseCompactReadOnly } from '@/lib/governanceReadOnlyLayout'

const SLA_CELL = 'px-2 py-1.5 align-middle'
const SLA_INPUT = 'h-8 text-xs w-full'

interface SlaSectionProps {
  slaProperties: SlaProperty[]
  onChange: (sla: SlaProperty[]) => void
  isLocked: boolean
  docCompact?: boolean
}

function makeSla(): SlaProperty {
  return { id: generateId(), value: '', unit: '', element: '', driver: '', description: '' }
}

function slaPropertyDisplay(property?: SlaPropertyType): string {
  if (!property) return ''
  return SLA_PROPERTY_LABELS[property]
}

const thClass = `${governanceTableHeadClass} text-left px-2 py-2 font-semibold`

function SlaReadOnlyRow({ row }: { row: SlaProperty }) {
  return (
    <>
      <td className={SLA_CELL}>
        <GovernanceReadOnlyCell value={slaPropertyDisplay(row.property) || '—'} />
      </td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.value} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.unit ?? ''} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.element ?? ''} mono /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.driver ?? ''} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.description ?? ''} /></td>
    </>
  )
}

export function SlaSection({ slaProperties, onChange, isLocked, docCompact }: SlaSectionProps) {
  const update = (id: string, patch: Partial<SlaProperty>) =>
    onChange(slaProperties.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(slaProperties.filter(s => s.id !== id))

  const useCompactLayout = shouldUseCompactReadOnly(isLocked, slaProperties.length)

  return (
    <div className="max-w-[840px] w-full">
      <ContractSectionHeader
        title="Service levels"
        description={SLA_SECTION_INTRO}
        compact={docCompact && isLocked}
      />

      {slaProperties.length === 0 ? (
        <GovernanceEmptyState
          icon={Clock}
          title={SLA_EMPTY_TITLE}
          body={SLA_EMPTY_BODY}
          ctaLabel={SLA_EMPTY_CTA}
          onCta={() => onChange([makeSla()])}
          isLocked={isLocked}
        />
      ) : useCompactLayout ? (
        <SlaCompactList rows={slaProperties} compact={docCompact} />
      ) : (
        <div className={`${governanceTableShellClass} overflow-x-auto`}>
          <table className="w-full text-xs border-collapse table-fixed min-w-[760px]">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[88px]" />
              <col className="w-[72px]" />
              <col className="w-[140px]" />
              <col className="w-[100px]" />
              <col />
              {!isLocked && <col className="w-[36px]" />}
            </colgroup>
            <thead>
              <tr className={governanceTableHeadRowClass}>
                <th className={thClass}>Type *</th>
                <th className={thClass}>Value *</th>
                <th className={thClass}>Unit</th>
                <th className={thClass}>Element</th>
                <th className={thClass}>Driver</th>
                <th className={thClass}>Description</th>
                {!isLocked && <th className="w-[36px]" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {slaProperties.map(row => {
                if (isLocked) {
                  return (
                    <tr key={row.id}>
                      <SlaReadOnlyRow row={row} />
                    </tr>
                  )
                }

                return (
                  <tr key={row.id}>
                    <td className={SLA_CELL}>
                      <Select
                        value={row.property ?? undefined}
                        onValueChange={v => update(row.id, { property: v as SlaPropertyType })}
                      >
                        <SelectTrigger className={SLA_INPUT}>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {SLA_PROPERTY_TYPES.map(p => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {SLA_PROPERTY_LABELS[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.value}
                        onChange={e => update(row.id, { value: e.target.value })}
                        className={SLA_INPUT}
                        placeholder="e.g. 4"
                      />
                    </td>
                    <td className={SLA_CELL}>
                      <Select
                        value={row.unit?.trim() || undefined}
                        onValueChange={v => update(row.id, { unit: v ?? '' })}
                      >
                        <SelectTrigger className={SLA_INPUT}><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                          {SLA_UNITS.map(u => (
                            <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.element ?? ''}
                        onChange={e => update(row.id, { element: e.target.value })}
                        className={cn(SLA_INPUT, 'font-mono')}
                        placeholder="table.field"
                        title="Object.Property — comma-separate multiples"
                      />
                    </td>
                    <td className={SLA_CELL}>
                      <Select
                        value={row.driver?.trim() || undefined}
                        onValueChange={v => update(row.id, { driver: v ?? '' })}
                      >
                        <SelectTrigger className={SLA_INPUT}><SelectValue placeholder="Driver" /></SelectTrigger>
                        <SelectContent>
                          {SLA_DRIVERS.map(d => (
                            <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.description ?? ''}
                        onChange={e => update(row.id, { description: e.target.value })}
                        className={SLA_INPUT}
                        placeholder="Optional note"
                      />
                    </td>
                    <td className={cn(SLA_CELL, 'text-center')}>
                      <GovernanceDeleteButton
                        onClick={() => remove(row.id)}
                        aria-label="Remove service level"
                        className="inline-flex"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!isLocked && (
            <GovernanceTableFooter
              label={SLA_EMPTY_CTA}
              onAdd={() => onChange([...slaProperties, makeSla()])}
            />
          )}
        </div>
      )}
    </div>
  )
}
