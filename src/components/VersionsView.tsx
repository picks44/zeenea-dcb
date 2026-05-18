import { Plus, Minus, Equal, Upload, Clock, ArrowRight, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { DataContract, DataContractSnapshot } from '@/types/odcs'
import { timeAgo, cn } from '@/lib/utils'

interface VersionsViewProps {
  contract: DataContract
  canPublish: boolean
  publishBlockReason: string | null
  onPushToGit: () => void
  onVersionClick: (hash: string) => void
  onDiscardDraft: () => void
}

function diffSummary(contract: DataContract, snapshot: DataContractSnapshot) {
  const cur  = contract.dataset.flatMap(t => t.columns)
  const prev = snapshot.dataset.flatMap(t => t.columns)
  const names = Array.from(new Set([...cur.map(c => c.physicalName), ...prev.map(c => c.physicalName)]))
  let added = 0, removed = 0, modified = 0
  for (const name of names) {
    const c = cur.find(x => x.physicalName === name)
    const p = prev.find(x => x.physicalName === name)
    if (!p) added++
    else if (!c) removed++
    else if (JSON.stringify({ ...c, id: '' }) !== JSON.stringify({ ...p, id: '' })) modified++
  }
  return { added, removed, modified }
}

export function VersionsView({
  contract, canPublish, publishBlockReason,
  onPushToGit, onVersionClick, onDiscardDraft,
}: VersionsViewProps) {
  const { gitHistory } = contract
  const commits = [...gitHistory].reverse()
  const lastCommit = gitHistory[gitHistory.length - 1]

  const hasUnpublishedChanges = !lastCommit || new Date(contract.updatedAt) > new Date(lastCommit.timestamp)
  const hasDraftRow = contract.info.status === 'draft' || contract.inRevision || hasUnpublishedChanges
  const canCompareCurrent = hasDraftRow && !!lastCommit?.snapshot

  const gitState = !lastCommit ? 'never'
    : new Date(contract.updatedAt) > new Date(lastCommit.timestamp) ? 'unpushed'
    : 'synced'

  const showTimeline = hasDraftRow || commits.length > 0

  // Shared hover-action button classes
  const actionBtn = cn(
    'flex items-center gap-1 h-6 px-2.5 rounded border text-[11px] font-medium transition-all',
    'border-neutral-200 bg-white text-neutral-400',
    'hover:border-blue-100 hover:text-blue-700 hover:bg-blue-25',
    'opacity-0 group-hover:opacity-100'
  )

  return (
    <div className="max-w-[600px] w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Version history</h2>
          <p className="text-neutral-400 text-xs mt-0.5">
            {gitHistory.length === 0
              ? 'No published versions yet.'
              : `${gitHistory.length} published version${gitHistory.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {contract.info.status !== 'deprecated' && (gitState === 'never' || gitState === 'unpushed') && (
          canPublish ? (
            <Button size="sm" onClick={onPushToGit} className="h-8 text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {gitState === 'never' ? 'Publish' : 'Publish update'}
            </Button>
          ) : (
            <Tooltip content={publishBlockReason!} side="bottom" delayDuration={300}>
              <span>
                <Button size="sm" disabled className="h-8 text-xs gap-1.5 pointer-events-none">
                  <Upload className="h-3.5 w-3.5" />
                  {gitState === 'never' ? 'Publish' : 'Publish update'}
                </Button>
              </span>
            </Tooltip>
          )
        )}
      </div>

      {/* Empty state */}
      {!showTimeline && (
        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-600">No versions yet</p>
          <p className="text-xs text-neutral-400 max-w-xs">
            Each time you publish, a snapshot is saved here with a version number and description.
          </p>
          <button onClick={onPushToGit} className="mt-1 text-xs text-blue-700 font-medium underline">
            Publish now →
          </button>
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div>
          <div className="space-y-3">

            {/* Draft / working copy card */}
            {hasDraftRow && (() => {
              const diff = canCompareCurrent ? diffSummary(contract, lastCommit!.snapshot!) : null
              const isLast = commits.length === 0
              return (
                <div className="group flex gap-3">
                  {/* Dot + connector */}
                  <div className="flex flex-col items-center w-[14px] flex-shrink-0">
                    <div className="mt-[14px] h-[14px] w-[14px] rounded-full bg-blue-700 border-2 border-white shadow-sm flex-shrink-0 relative z-10 ring-2 ring-blue-100" />
                    {!isLast && <div className="w-px flex-1 bg-neutral-100 mt-1.5 -mb-3" />}
                  </div>

                  <div className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-neutral-900">Draft</span>
                        </div>
                        {diff ? (
                          <div className="flex items-center gap-2.5 mt-1.5 text-[11px]">
                            {diff.added > 0 && (
                              <span className="flex items-center gap-0.5 text-green-700">
                                <Plus className="h-3 w-3" />{diff.added} field{diff.added > 1 ? 's' : ''}
                              </span>
                            )}
                            {diff.removed > 0 && (
                              <span className="flex items-center gap-0.5 text-red-700">
                                <Minus className="h-3 w-3" />{diff.removed} removed
                              </span>
                            )}
                            {diff.modified > 0 && (
                              <span className="flex items-center gap-0.5 text-orange-700">
                                <Equal className="h-3 w-3" />{diff.modified} modified
                              </span>
                            )}
                            {diff.added === 0 && diff.removed === 0 && diff.modified === 0 && (
                              <span className="text-neutral-300">No field changes since last version</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-300 mt-1">Not published yet</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {canCompareCurrent && (
                            <button onClick={() => onVersionClick('draft')} className={actionBtn}>
                              <ArrowRight className="h-3 w-3" />
                              Compare
                            </button>
                          )}
                          {lastCommit?.snapshot && (
                            <Tooltip content={`Revert to v${lastCommit.version}`} side="top" delayDuration={400}>
                              <button
                                onClick={onDiscardDraft}
                                className={cn(
                                  'flex items-center justify-center h-6 w-6 rounded border transition-all',
                                  'border-neutral-200 bg-white text-neutral-300',
                                  'hover:border-red-100 hover:text-red-700 hover:bg-red-25',
                                )}
                              >
                                <Undo2 className="h-3 w-3" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-300 w-10 text-right flex-shrink-0">now</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Published version cards */}
            {commits.map((commit, i) => {
              const isLatest = i === 0
              const isLast = i === commits.length - 1
              const canCompareCommit = !!commit.snapshot
              return (
                <div key={commit.hash} className="group flex items-start gap-3">
                  <div className="flex flex-col items-center w-[14px] flex-shrink-0">
                    <div className={cn(
                      'mt-[18px] h-[14px] w-[14px] rounded-full border-2 border-white shadow-sm flex-shrink-0 relative z-10',
                      isLatest ? 'bg-neutral-600 ring-2 ring-neutral-200' : 'bg-neutral-200'
                    )} />
                    {!isLast && <div className="w-px flex-1 bg-neutral-100 mt-1.5 -mb-3" />}
                  </div>

                  <div className={cn(
                    'flex-1 bg-white border rounded-xl px-4 py-3.5 shadow-sm',
                    isLatest ? 'border-neutral-200' : 'border-neutral-100'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-semibold truncate',
                          isLatest ? 'text-neutral-900' : 'text-neutral-400'
                        )}>
                          {commit.message || `Version ${commit.version}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="version">v{commit.version}</Badge>
                          {isLatest
                            ? <Badge variant="active">Active</Badge>
                            : <Badge variant="deprecated">Deprecated</Badge>
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {canCompareCommit && (
                            <button onClick={() => onVersionClick(commit.hash)} className={actionBtn}>
                              <ArrowRight className="h-3 w-3" />
                              Compare
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-300 w-10 text-right flex-shrink-0 whitespace-nowrap">
                          {timeAgo(commit.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
