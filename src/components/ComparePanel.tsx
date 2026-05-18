import { Plus, Minus, Equal, GitBranch as GitIcon } from 'lucide-react'
import { DataContract, DataContractSnapshot } from '@/types/odcs'
import { cn } from '@/lib/utils'

interface ComparePanelProps {
  contract: DataContract
  snapshot: DataContractSnapshot
}

export function ComparePanel({ contract, snapshot }: ComparePanelProps) {
  const currentCols = contract.dataset.flatMap(t => t.columns.map(c => ({ ...c, table: t.physicalName })))
  const snapCols    = snapshot.dataset.flatMap(t => t.columns.map(c => ({ ...c, table: t.physicalName })))

  const allNames = Array.from(new Set([...currentCols.map(c => c.physicalName), ...snapCols.map(c => c.physicalName)]))

  const rows = allNames.map(name => {
    const cur  = currentCols.find(c => c.physicalName === name)
    const prev = snapCols.find(c => c.physicalName === name)
    const status = !prev ? 'added' : !cur ? 'removed' : JSON.stringify({ ...cur, id: '' }) !== JSON.stringify({ ...prev, id: '' }) ? 'modified' : 'same'
    return { name, cur, prev, status }
  })

  const added    = rows.filter(r => r.status === 'added').length
  const removed  = rows.filter(r => r.status === 'removed').length
  const modified = rows.filter(r => r.status === 'modified').length

  return (
    <div className="mb-6 bg-white border border-[#d3d3e5] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#fbfbff] border-b border-[#e4e4f0]">
        <GitIcon className="h-3.5 w-3.5 text-[#656574]" />
        <span className="text-xs font-semibold text-[#33333d]">Changes since v{snapshot.info.version}</span>
        <div className="flex items-center gap-2 ml-auto text-[11px]">
          {added    > 0 && <span className="flex items-center gap-0.5 text-[#047800]"><Plus  className="h-3 w-3" />{added} added</span>}
          {removed  > 0 && <span className="flex items-center gap-0.5 text-[#c12c11]"><Minus className="h-3 w-3" />{removed} removed</span>}
          {modified > 0 && <span className="flex items-center gap-0.5 text-[#d27b00]"><Equal className="h-3 w-3" />{modified} modified</span>}
          {added === 0 && removed === 0 && modified === 0 && <span className="text-[#656574]">No changes</span>}
        </div>
      </div>

      {rows.filter(r => r.status !== 'same').length === 0 ? (
        <div className="px-4 py-4 text-xs text-[#656574] text-center">No changes detected.</div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {rows.filter(r => r.status !== 'same').map(({ name, cur, prev, status }) => (
            <div key={name} className={cn(
              'flex items-start gap-3 px-4 py-2.5 text-xs',
              status === 'added'    && 'bg-[#f0ffec]/60',
              status === 'removed'  && 'bg-[#fff2ee]/60',
              status === 'modified' && 'bg-[#fff8ec]/60',
            )}>
              <span className={cn(
                'font-bold w-4 flex-shrink-0 mt-0.5',
                status === 'added'    && 'text-[#047800]',
                status === 'removed'  && 'text-[#c12c11]',
                status === 'modified' && 'text-[#d27b00]',
              )}>
                {status === 'added' ? '+' : status === 'removed' ? '−' : '~'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-mono font-semibold text-[#2a2a30]">{name}</span>
                {cur && <span className="ml-2 text-[#656574]">{cur.logicalType}</span>}
                {prev && !cur && <span className="ml-2 text-[#656574] line-through">{prev.logicalType}</span>}
                {status === 'modified' && prev && cur && (
                  <div className="mt-0.5 text-[11px] text-[#3f3f4a] space-y-0.5">
                    {prev.logicalType !== cur.logicalType && <div>Type: <span className="line-through text-[#c12c11]">{prev.logicalType}</span> → <span className="text-[#047800]">{cur.logicalType}</span></div>}
                    {prev.physicalType !== cur.physicalType && <div>Storage type: <span className="line-through text-[#c12c11]">{prev.physicalType}</span> → <span className="text-[#047800]">{cur.physicalType}</span></div>}
                    {prev.description !== cur.description && <div>Description changed</div>}
                    {prev.required !== cur.required && <div>Required: {prev.required ? 'yes' : 'no'} → {cur.required ? 'yes' : 'no'}</div>}
                    {prev.isPII !== cur.isPII && <div>PII: {prev.isPII ? 'yes' : 'no'} → {cur.isPII ? 'yes' : 'no'}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
