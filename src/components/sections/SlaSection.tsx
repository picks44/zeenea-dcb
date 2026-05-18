import { Plus, Trash2, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
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

export function SlaSection({ slaProperties, onChange, isLocked }: SlaSectionProps) {
  const update = (id: string, patch: Partial<SlaProperty>) =>
    onChange(slaProperties.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const remove = (id: string) => onChange(slaProperties.filter(s => s.id !== id))

  return (
    <div className="max-w-[960px] w-full">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#12131f]">Service levels</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5">
          Define latency, retention, availability, and other service level commitments for this contract.
        </p>
      </div>

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
        <div className="border border-[#d3d3e5] rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-xs border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#e4e4f0] bg-[#fbfbff]/80">
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px]">Property</th>
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px]">Value</th>
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px] w-20">Unit</th>
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px]">Element</th>
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px] w-24">Driver</th>
                <th className="text-left px-3 py-2 font-semibold text-[#656574] uppercase tracking-wide text-[10px]">Description</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4f0]">
              {slaProperties.map(row => {
                const isCustom = !PROPERTY_PRESETS.slice(0, -1).includes(row.property as typeof PROPERTY_PRESETS[number])
                const preset = isCustom ? 'custom' : row.property
                return (
                  <tr key={row.id}>
                    <td className="px-3 py-2">
                      <Select
                        value={preset}
                        onValueChange={v => {
                          if (!v) return
                          update(row.id, { property: v === 'custom' ? '' : v })
                        }}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="h-8 text-xs w-full min-w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROPERTY_PRESETS.map(p => (
                            <SelectItem key={p} value={p} className="text-xs capitalize">{p === 'custom' ? 'Custom…' : p}</SelectItem>
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
                    <td className="px-3 py-2">
                      <Input value={row.value} onChange={e => update(row.id, { value: e.target.value })} disabled={isLocked} className="h-8 text-xs" placeholder="e.g. 4" />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={row.unit ?? ''} onChange={e => update(row.id, { unit: e.target.value })} disabled={isLocked} className="h-8 text-xs" placeholder="d" />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={row.element ?? ''} onChange={e => update(row.id, { element: e.target.value })} disabled={isLocked} className="h-8 text-xs font-mono" placeholder="table.col" />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={row.driver ?? ''} onChange={e => update(row.id, { driver: e.target.value })} disabled={isLocked} className="h-8 text-xs" placeholder="operational" />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={row.description ?? ''} onChange={e => update(row.id, { description: e.target.value })} disabled={isLocked} className="h-8 text-xs" placeholder="Optional" />
                    </td>
                    <td className="px-2 py-2">
                      {!isLocked && (
                        <button type="button" onClick={() => remove(row.id)} className="h-8 w-8 flex items-center justify-center text-[#9898a7] hover:text-[#c12c11] rounded">
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
            <div className="px-3 py-2 border-t border-[#e4e4f0] bg-[#fbfbff]/40">
              <button type="button" onClick={() => onChange([...slaProperties, makeSla()])} className="flex items-center gap-1.5 text-xs text-[#656574] hover:text-[#0550dc] font-medium">
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
