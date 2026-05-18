import { Plus, Trash2, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { GovernanceReadOnlyCell } from '@/components/shared/GovernanceReadOnlyCell'
import { SlaCompactList } from '@/components/shared/SlaCompactList'
import {
  governanceTableFooterActionClass,
  governanceTableFooterClass,
  governanceTableHeadClass,
  governanceTableHeadRowClass,
  governanceTableShellClass,
  GovernanceSectionHeader,
} from '@/components/shared/GovernanceSectionHeader'
import { cn } from '@/lib/utils'
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

const SLA_PROPERTY_LABELS: Record<(typeof PROPERTY_PRESETS)[number], string> = {
  latency: 'Latency',
  retention: 'Retention',
  frequency: 'Frequency',
  generalAvailability: 'Availability',
  endOfSupport: 'End of support',
  endOfLife: 'End of life',
  timeOfAvailability: 'Time of availability',
  custom: 'Custom…',
}

const SLA_CELL = 'px-2 py-1.5 align-middle'
const SLA_INPUT = 'h-8 text-xs w-full'

interface SlaSectionProps {
  slaProperties: SlaProperty[]
  onChange: (sla: SlaProperty[]) => void
  isLocked: boolean
  isPublishedView?: boolean
  docCompact?: boolean
}

function makeSla(): SlaProperty {
  return { id: generateId(), property: 'latency', value: '', unit: '', element: '', driver: '', description: '' }
}

const thClass = `${governanceTableHeadClass} text-left px-2 py-2 font-semibold`

function slaPropertyLabel(row: SlaProperty): string {
  const isCustom = !PROPERTY_PRESETS.slice(0, -1).includes(row.property as (typeof PROPERTY_PRESETS)[number])
  if (isCustom && row.property.trim()) return row.property.trim()
  const preset = isCustom ? 'custom' : row.property
  return SLA_PROPERTY_LABELS[preset as (typeof PROPERTY_PRESETS)[number]] ?? row.property
}

function SlaReadOnlyRow({ row }: { row: SlaProperty }) {
  return (
    <>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={slaPropertyLabel(row)} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.value} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.unit ?? ''} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.element ?? ''} mono /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.driver ?? ''} /></td>
      <td className={SLA_CELL}><GovernanceReadOnlyCell value={row.description ?? ''} /></td>
    </>
  )
}

export function SlaSection({ slaProperties, onChange, isLocked, isPublishedView, docCompact }: SlaSectionProps) {
  const update = (id: string, patch: Partial<SlaProperty>) =>
    onChange(slaProperties.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(slaProperties.filter(s => s.id !== id))

  return (
    <div className="max-w-[840px] w-full">
      <GovernanceSectionHeader
        title="Service levels"
        description="Define latency, retention, availability, and other service level commitments for this contract."
        compact={docCompact}
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
      ) : isPublishedView && slaProperties.length <= 2 ? (
        <SlaCompactList rows={slaProperties} compact={docCompact} />
      ) : (
        <div className={`${governanceTableShellClass} overflow-x-auto`}>
          <table className="w-full text-xs border-collapse table-fixed min-w-[760px]">
            <colgroup>
              <col className="w-[152px]" />
              <col className="w-[68px]" />
              <col className="w-[56px]" />
              <col className="w-[124px]" />
              <col className="w-[104px]" />
              <col />
              {!isLocked && <col className="w-[36px]" />}
            </colgroup>
            <thead>
              <tr className={governanceTableHeadRowClass}>
                <th className={thClass}>Property</th>
                <th className={thClass}>Value</th>
                <th className={thClass}>Unit</th>
                <th className={thClass}>Element</th>
                <th className={thClass}>Driver</th>
                <th className={thClass}>Description</th>
                {!isLocked && <th className="w-[36px]" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4f0]">
              {slaProperties.map(row => {
                if (isLocked) {
                  return (
                    <tr key={row.id}>
                      <SlaReadOnlyRow row={row} />
                    </tr>
                  )
                }

                const isCustom = !PROPERTY_PRESETS.slice(0, -1).includes(row.property as typeof PROPERTY_PRESETS[number])
                const preset = isCustom ? 'custom' : row.property
                return (
                  <tr key={row.id}>
                    <td className={SLA_CELL}>
                      <Select
                        value={preset}
                        onValueChange={v => {
                          if (!v) return
                          update(row.id, { property: v === 'custom' ? '' : v })
                        }}
                      >
                        <SelectTrigger className={SLA_INPUT}>
                          <SelectValue>
                            {(v: string) => {
                              if (v === 'custom' && row.property.trim()) return row.property
                              return SLA_PROPERTY_LABELS[v as (typeof PROPERTY_PRESETS)[number]] ?? v
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_PRESETS.map(p => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {SLA_PROPERTY_LABELS[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(preset === 'custom' || isCustom) && (
                        <Input
                          value={row.property}
                          onChange={e => update(row.id, { property: e.target.value })}
                          placeholder="Custom property"
                          className={cn(SLA_INPUT, 'mt-1')}
                        />
                      )}
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.value}
                        onChange={e => update(row.id, { value: e.target.value })}
                        className={SLA_INPUT}
                        placeholder="Value"
                      />
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.unit ?? ''}
                        onChange={e => update(row.id, { unit: e.target.value })}
                        className={SLA_INPUT}
                        placeholder="Unit"
                      />
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.element ?? ''}
                        onChange={e => update(row.id, { element: e.target.value })}
                        className={cn(SLA_INPUT, 'font-mono')}
                        placeholder="Table or field"
                      />
                    </td>
                    <td className={SLA_CELL}>
                      <Input
                        value={row.driver ?? ''}
                        onChange={e => update(row.id, { driver: e.target.value })}
                        className={SLA_INPUT}
                        placeholder="e.g. Operations"
                      />
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
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="h-7 w-7 inline-flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] rounded transition-colors"
                        aria-label="Remove service level"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
                className={governanceTableFooterActionClass}
              >
                <Plus className="h-3.5 w-3.5" />
                {SLA_EMPTY_CTA}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
