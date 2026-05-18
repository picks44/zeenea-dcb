import { useState, useMemo } from 'react'
import { X, GitBranch, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataContract, DataContractSnapshot } from '@/types/odcs'
import { cn, timeAgo } from '@/lib/utils'
import { snapshotToYaml } from '@/lib/odcsYamlGenerator'
import {
  compareExportedSnapshots,
  contractToComparisonSnapshot,
  type FormDiffRow,
} from '@/lib/exportedContractDiff'

function contractToSnapshot(c: DataContract): DataContractSnapshot {
  return contractToComparisonSnapshot(c)
}

// ─── LCS diff ─────────────────────────────────────────────────────────────────

type DiffRow = { left: string | null; right: string | null; kind: 'same' | 'changed' }

function buildDiff(leftLines: string[], rightLines: string[]): DiffRow[] {
  const m = leftLines.length, n = rightLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = leftLines[i] === rightLines[j]
        ? dp[i+1][j+1] + 1
        : Math.max(dp[i+1][j], dp[i][j+1])

  const pairs: [number, number][] = []
  let i = 0, j = 0
  while (i < m && j < n) {
    if (leftLines[i] === rightLines[j]) { pairs.push([i, j]); i++; j++ }
    else if (dp[i+1]?.[j] >= dp[i]?.[j+1]) i++
    else j++
  }

  const rows: DiffRow[] = []
  let li = 0, ri = 0
  for (const [lm, rm] of pairs) {
    const ld = lm - li, rd = rm - ri
    for (let k = 0; k < Math.max(ld, rd); k++)
      rows.push({ kind: 'changed', left: k < ld ? leftLines[li + k] : null, right: k < rd ? rightLines[ri + k] : null })
    li = lm; ri = rm
    rows.push({ kind: 'same', left: leftLines[li], right: rightLines[ri] })
    li++; ri++
  }
  const ld = leftLines.length - li, rd = rightLines.length - ri
  for (let k = 0; k < Math.max(ld, rd); k++)
    rows.push({ kind: 'changed', left: k < ld ? leftLines[li + k] : null, right: k < rd ? rightLines[ri + k] : null })

  return rows
}

// ─── YAML diff view ───────────────────────────────────────────────────────────

function YamlDiffView({ left, right }: { left: DataContractSnapshot; right: DataContractSnapshot }) {
  const rows = useMemo(() => {
    const ll = snapshotToYaml(left).split('\n')
    const rl = snapshotToYaml(right).split('\n')
    const raw = buildDiff(ll, rl)
    let ln = 1, rn = 1
    return raw.map(row => ({
      ...row,
      leftNum:  row.left  !== null ? ln++ : null,
      rightNum: row.right !== null ? rn++ : null,
    }))
  }, [left, right])

  return (
    <div className="flex-1 overflow-auto bg-[#0d1117]">
      <table className="w-full border-collapse text-[11.5px] font-mono leading-[19px] min-w-0">
        <colgroup>
          <col style={{ width: '28px' }} />
          <col style={{ width: '22px' }} />
          <col />
          <col style={{ width: '1px' }} />
          <col style={{ width: '28px' }} />
          <col style={{ width: '22px' }} />
          <col />
        </colgroup>
        <tbody>
          {rows.map((row, idx) => {
            const onlyLeft  = row.kind === 'changed' && row.left  !== null && row.right === null
            const onlyRight = row.kind === 'changed' && row.right !== null && row.left  === null
            const modified  = row.kind === 'changed' && row.left  !== null && row.right !== null
            const leftDiff  = onlyLeft || modified
            const rightDiff = onlyRight || modified

            return (
              <tr key={idx}>
                {/* Left line number */}
                <td className={cn(
                  'pl-2 pr-1 text-right text-[10px] leading-[19px] select-none align-top tabular-nums',
                  leftDiff  ? 'bg-[#3d1c1c] text-[#f85149]/60' : 'bg-[#161b22] text-[#484f58]'
                )}>
                  {row.leftNum ?? ''}
                </td>
                {/* Left gutter */}
                <td className={cn(
                  'text-center text-[11px] font-bold leading-[19px] align-top select-none',
                  leftDiff ? 'bg-[#3d1c1c] text-[#f85149]' : 'bg-[#161b22] text-transparent'
                )}>
                  {leftDiff ? '−' : ' '}
                </td>
                {/* Left content */}
                <td className={cn(
                  'pl-2 pr-6 py-px whitespace-pre align-top',
                  leftDiff         ? 'bg-[#2d1717] text-[#ffa198]' : 'text-[#c9d1d9]',
                  row.left === null ? 'bg-[#161b22]'                 : !leftDiff ? 'bg-[#0d1117]' : '',
                )}>
                  {row.left ?? ''}
                </td>

                {/* Divider */}
                <td className="bg-[#30363d] w-px p-0" />

                {/* Right line number */}
                <td className={cn(
                  'pl-2 pr-1 text-right text-[10px] leading-[19px] select-none align-top tabular-nums',
                  rightDiff ? 'bg-[#1a3626] text-[#3fb950]/60' : 'bg-[#161b22] text-[#484f58]'
                )}>
                  {row.rightNum ?? ''}
                </td>
                {/* Right gutter */}
                <td className={cn(
                  'text-center text-[11px] font-bold leading-[19px] align-top select-none',
                  rightDiff ? 'bg-[#1a3626] text-[#3fb950]' : 'bg-[#161b22] text-transparent'
                )}>
                  {rightDiff ? '+' : ' '}
                </td>
                {/* Right content */}
                <td className={cn(
                  'pl-2 pr-6 py-px whitespace-pre align-top',
                  rightDiff         ? 'bg-[#0f2a1d] text-[#aff5b4]' : 'text-[#c9d1d9]',
                  row.right === null ? 'bg-[#161b22]'                  : !rightDiff ? 'bg-[#0d1117]' : '',
                )}>
                  {row.right ?? ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Form diff view ───────────────────────────────────────────────────────────

function DiffValue({ left, right }: { left: string; right: string }) {
  if (left === right) return <span className="text-xs text-[#33333d]">{left || <em className="text-[#9898a7]">empty</em>}</span>
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs line-through text-[#c12c11]/80">{left  || <em>empty</em>}</span>
      <span className="text-xs text-[#047800] font-medium">{right || <em>empty</em>}</span>
    </div>
  )
}

function IdenticalVersionsView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="h-10 w-10 rounded-full bg-[#f5f5fa] flex items-center justify-center">
        <GitBranch className="h-5 w-5 text-[#9898a7]" />
      </div>
      <p className="text-sm text-[#656574] font-medium">These versions are identical</p>
      <p className="text-xs text-[#9898a7] max-w-sm">
        No differences in the exported ODCS contract payload between the selected versions.
      </p>
    </div>
  )
}

function FormDiffRowView({ row }: { row: FormDiffRow }) {
  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3',
      row.kind === 'added' && 'bg-[#f0ffec]/50',
      row.kind === 'removed' && 'bg-[#fff2ee]/50',
      row.kind === 'modified' && 'bg-[#fff8ec]/50',
    )}>
      <span className={cn(
        'text-xs font-bold w-4 flex-shrink-0 mt-0.5 font-mono',
        row.kind === 'added' && 'text-[#047800]',
        row.kind === 'removed' && 'text-[#c12c11]',
        row.kind === 'modified' && 'text-[#d27b00]',
      )}>
        {row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : '~'}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-mono font-semibold text-[#2a2a30]">{row.label}</span>
        {row.kind === 'modified' ? (
          <div className="mt-1">
            <DiffValue left={row.left} right={row.right} />
            {row.detail && <p className="text-[11px] text-[#656574] mt-1">{row.detail}</p>}
          </div>
        ) : row.kind === 'added' ? (
          <p className="text-[11px] text-[#047800] mt-0.5">{row.right}</p>
        ) : (
          <p className="text-[11px] text-[#c12c11] mt-0.5 line-through">{row.left}</p>
        )}
      </div>
    </div>
  )
}

function FormDiffView({ left, right }: { left: DataContractSnapshot; right: DataContractSnapshot }) {
  const diff = useMemo(() => compareExportedSnapshots(left, right), [left, right])
  if (diff.identical) return <IdenticalVersionsView />

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 space-y-6 max-w-3xl mx-auto">
        {diff.formSections.map(section => (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#656574]">{section.title}</span>
              <span className="text-[10px] text-[#9898a7] bg-[#f5f5fa] px-1.5 py-0.5 rounded-full">
                {section.rows.length} change{section.rows.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="bg-white border border-[#d3d3e5] rounded-xl overflow-hidden shadow-sm divide-y divide-zinc-100">
              {section.rows.map(row => (
                <FormDiffRowView key={`${section.id}-${row.label}-${row.kind}`} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Version source ───────────────────────────────────────────────────────────

interface VersionSource {
  id: string
  version: string
  sublabel: string
  snapshot: DataContractSnapshot
}

/** Default compare direction: left = baseline, right = incoming changes. */
function defaultComparePair(
  initialHash: string,
  sources: VersionSource[],
): { leftId: string; rightId: string } {
  if (sources.length === 0) return { leftId: '', rightId: '' }
  if (sources.length === 1) return { leftId: sources[0].id, rightId: sources[0].id }

  if (initialHash === 'draft') {
    const latestPublished = sources.find(s => s.id !== 'draft')
    return {
      leftId: latestPublished?.id ?? sources[1]?.id ?? sources[0].id,
      rightId: 'draft',
    }
  }

  const idx = sources.findIndex(s => s.id === initialHash)
  const base = idx >= 0 ? initialHash : sources[0].id
  const baseIdx = sources.findIndex(s => s.id === base)
  return {
    leftId: base,
    rightId: sources[baseIdx + 1]?.id ?? sources[0].id,
  }
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface VersionCompareModalProps {
  contract: DataContract
  initialHash: string
  open: boolean
  onClose: () => void
}

export function VersionCompareModal({ contract, initialHash, open, onClose }: VersionCompareModalProps) {
  const sources = useMemo((): VersionSource[] => {
    const list: VersionSource[] = []
    if (contract.info.status === 'draft' || !contract.gitHistory.length || new Date(contract.updatedAt) > new Date(contract.gitHistory[contract.gitHistory.length - 1].timestamp)) {
      list.push({ id: 'draft', version: contract.info.version, sublabel: 'Draft · now', snapshot: contractToSnapshot(contract) })
    }
    for (const commit of [...contract.gitHistory].reverse()) {
      if (commit.snapshot) {
        list.push({
          id: commit.hash,
          version: commit.version,
          sublabel: [commit.message, timeAgo(commit.timestamp)].filter(Boolean).join(' · '),
          snapshot: commit.snapshot,
        })
      }
    }
    return list
  }, [contract])

  const [leftId, setLeftId] = useState(() => defaultComparePair(initialHash, sources).leftId)
  const [rightId, setRightId] = useState(() => defaultComparePair(initialHash, sources).rightId)
  const [mode, setMode] = useState<'form' | 'yaml'>('form')

  const leftSource  = sources.find(s => s.id === leftId)
  const rightSource = sources.find(s => s.id === rightId)
  const sameSource  = leftId === rightId

  const exportDiff = useMemo(
    () =>
      leftSource && rightSource && !sameSource
        ? compareExportedSnapshots(leftSource.snapshot, rightSource.snapshot)
        : null,
    [leftSource, rightSource, sameSource],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: '1040px', height: '82vh' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e4e4f0] flex-shrink-0 bg-white">

          {/* Title */}
          <div className="flex items-center gap-2 mr-1 flex-shrink-0">
            <div className="h-7 w-7 rounded-lg bg-[#12131f] flex items-center justify-center">
              <GitBranch className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#12131f]">Compare</span>
          </div>

          {/* Left version select */}
          <Select value={leftId} onValueChange={v => v !== null && setLeftId(v)}>
            <SelectTrigger className="h-8 text-xs w-36 border-[#ffc4b0] bg-[#fff2ee] text-[#c12c11] font-semibold focus:border-[#c12c11] hover:bg-[#ffdacf] transition-colors">
              <SelectValue>
                {(id: string) => {
                  const s = sources.find(x => x.id === id)
                  return id === 'draft'
                    ? <span className="font-sans font-semibold">Draft</span>
                    : <span className="font-mono">{s?.version ?? '—'}</span>
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sources.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs py-2">
                  {s.id === 'draft'
                    ? <span className="font-semibold">Draft</span>
                    : <span className="font-mono font-semibold">{s.version}</span>
                  }
                  {s.sublabel && <span className="text-neutral-400 ml-2 text-[10px]">{s.sublabel}</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ArrowRight className="h-3.5 w-3.5 text-[#9898a7] flex-shrink-0" />

          {/* Right version select */}
          <Select value={rightId} onValueChange={v => v !== null && setRightId(v)}>
            <SelectTrigger className="h-8 text-xs w-36 border-[#b8dfb5] bg-[#f0ffec] text-[#047800] font-semibold focus:border-[#047800] hover:bg-[#d3efcd] transition-colors">
              <SelectValue>
                {(id: string) => {
                  const s = sources.find(x => x.id === id)
                  return id === 'draft'
                    ? <span className="font-sans font-semibold">Draft</span>
                    : <span className="font-mono">{s?.version ?? '—'}</span>
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sources.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs py-2">
                  {s.id === 'draft'
                    ? <span className="font-semibold">Draft</span>
                    : <span className="font-mono font-semibold">{s.version}</span>
                  }
                  {s.sublabel && <span className="text-neutral-400 ml-2 text-[10px]">{s.sublabel}</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          {/* Mode toggle pill */}
          <div className="flex items-center bg-[#f5f5fa] rounded-lg p-0.5 gap-px flex-shrink-0">
            <button
              onClick={() => setMode('form')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                mode === 'form' ? 'bg-white text-[#12131f] shadow-sm' : 'text-[#3f3f4a] hover:text-[#33333d]'
              )}
            >
              Form
            </button>
            <button
              onClick={() => setMode('yaml')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all',
                mode === 'yaml' ? 'bg-white text-[#12131f] shadow-sm' : 'text-[#3f3f4a] hover:text-[#33333d]'
              )}
            >
              YAML
            </button>
          </div>

          <Button variant="ghost" size="icon-sm" onClick={onClose} className="ml-2 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── YAML column subheader ── */}
        {mode === 'yaml' && !sameSource && (
          <div className="flex flex-shrink-0 border-b border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#f85149]" style={{ width: '50%' }}>
              <span className="font-mono bg-[#3d1c1c] px-1.5 py-0.5 rounded text-[10px]">−</span>
              <span className="font-mono">{leftId === 'draft' ? 'Draft' : leftSource?.version}</span>
            </div>
            <div className="w-px bg-[#30363d]" />
            <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#3fb950]" style={{ width: '50%' }}>
              <span className="font-mono bg-[#1a3626] px-1.5 py-0.5 rounded text-[10px]">+</span>
              <span className="font-mono">{rightId === 'draft' ? 'Draft' : rightSource?.version}</span>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        {sameSource ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-[#656574] font-medium">Select two different versions to compare</p>
          </div>
        ) : !leftSource || !rightSource ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-[#656574]">Not enough versions to compare yet.</p>
          </div>
        ) : exportDiff?.identical ? (
          <IdenticalVersionsView />
        ) : mode === 'yaml' ? (
          <YamlDiffView left={leftSource.snapshot} right={rightSource.snapshot} />
        ) : (
          <FormDiffView left={leftSource.snapshot} right={rightSource.snapshot} />
        )}
      </div>
    </div>
  )
}
