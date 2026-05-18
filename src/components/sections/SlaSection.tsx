import { Plus, Trash2, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import {
  governanceTableFooterClass,
  governanceTableHeadClass,
  governanceTableHeadRowClass,
  governanceTableShellClass,
  GovernanceSectionHeader,
} from '@/components/shared/GovernanceSectionHeader'
import { SLA_EMPTY_BODY, SLA_EMPTY_CTA, SLA_EMPTY_TITLE } from '@/lib/uxCopy'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlaProperty } from '@/types/odcs'
import { generateId } from '@/lib/utils'

const PROPERTY_PRESETS = [
  'latency',
  'retention',
  'frequency',
  'generalAvailability',
  'endOfSupport',
  'endOfLife',
  'timeOfAvailability',
  'custom',
] as const

interface SlaSectionProps {
  slaProperties: SlaProperty[]
  onChange: (sla: SlaProperty[]) => void
  isLocked: boolean
}

function makeSla(): SlaProperty {
  return { id: generateId(), property: 'latency', value: '', unit: '', element: '', driver: '', description: '' }
}

const thClass = `${governanceTableHeadClass} text-left px-2 py-2 font-semibold`

export function SlaSection({ slaProperties, onChange, isLocked }: SlaSectionProps) {
  const update = (id: string, patch: Partial<SlaProperty>) =>
    onChange(slaProperties.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(slaProperties.filter(s => s.id !== id))

  return (
    <div className="max-w-[840px] w-full">
      <GovernanceSectionHeader
        title="Service levels"
        description="Define latency, retention, availability, and other service level commitments for this contract."
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
      ) : (
        <div className={`${governanceTableShellClass} overflow-x-auto`}>
          <table className="w-full text-xs border-collapse table-fixed min-w-[760px]">
            <colgroup>
              <col className="w-[148px]" />
              <col className="w-[72px]" />
              <col className="w-[52px]" />
              <col className="w-[128px]" />
              <col className="w-[96px]" />
              <col />
              <col className="w-[36px]" />
            </colgroup>
            <thead>
              <tr className={governanceTableHeadRowClass}>
                <th className={thClass}>Property</th>
                <th className={thClass}>Value</th>
                <th className={thClass}>Unit</th>
                <th className={thClass}>Element</th>
                <th className={thClass}>Driver</th>
                <th className={thClass}>Description</th>
                <th className="w-[36px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4f0]">
              {slaProperties.map(row => {
                const isCustom = !PROPERTY_PRESETS.slice(0, -1).includes(row.property as typeof PROPERTY_PRESETS[number])
                const preset = isCustom ? 'custom' : row.property
                return (
                  <tr key={row.id} className="align-middle">
                    <td className="px-2 py-2 align-top">
                      <Select
                        value={preset}
                        onValueChange={v => {
                          if (!v) return
                          update(row.id, { property: v === 'custom' ? '' : v })
                        }}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROPERTY_PRESETS.map(p => (
                            <SelectItem key={p} value={p} className="text-xs capitalize">
                              {p === 'custom' ? 'Custom…' : p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(preset === 'custom' || isCustom) && (
                        <Input
                          value={row.property}
                          onChange={e => update(row.id, { property: e.target.value })}
                          placeholder="property name"
                          disabled={isLocked}
                          className="h-7 text-xs mt-1"
                        />
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.value}
                        onChange={e => update(row.id, { value: e.target.value })}
                        disabled={isLocked}
                        className="h-8 text-xs"
                        placeholder="4"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.unit ?? ''}
                        onChange={e => update(row.id, { unit: e.target.value })}
                        disabled={isLocked}
                        className="h-8 text-xs"
                        placeholder="d"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.element ?? ''}
                        onChange={e => update(row.id, { element: e.target.value })}
                        disabled={isLocked}
                        className="h-8 text-xs font-mono"
                        placeholder="table.col"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.driver ?? ''}
                        onChange={e => update(row.id, { driver: e.target.value })}
                        disabled={isLocked}
                        className="h-8 text-xs"
                        placeholder="operational"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={row.description ?? ''}
                        onChange={e => update(row.id, { description: e.target.value })}
                        disabled={isLocked}
                        className="h-8 text-xs"
                        placeholder="Optional"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => remove(row.id)}
                          className="h-7 w-7 inline-flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded transition-colors"
                          aria-label="Remove SLA property"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!isLocked && (
            <div className={governanceTableFooterClass}>
              <button
                type="button"
                onClick={() => onChange([...slaProperties, makeSla()])}
                className="flex items-center gap-1.5 text-xs text-[#656574] hover:text-[#0550dc] font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add SLA property
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
