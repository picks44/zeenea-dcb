import { Clock, ArrowRight, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { DataContract } from '@/types/odcs'
import { timeAgo, cn } from '@/lib/utils'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import {
  VERSION_HISTORY_INTRO_EMPTY,
  VERSIONS_CHANGES_NOT_PUBLISHED,
  VERSIONS_WORKING_COPY_LABEL,
  versionHistoryIntroCount,
} from '@/lib/uxCopy'
import {
  buildWorkingCopySummaryLines,
  hasWorkingCopyDraft,
  summarizeChangesSince,
} from '@/lib/contractVersionDiff'
import { getCommitChangelog, getCommitTitle, parseChangelogLines } from '@/lib/versionHistory'

interface VersionsViewProps {
  contract: DataContract
  onVersionClick: (hash: string) => void
  onDiscardDraft: () => void
}

function VersionChangelog({ text }: { text: string }) {
  const lines = parseChangelogLines(text)
  if (lines.length === 0) return null

  if (lines.length === 1) {
    return (
      <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug">{lines[0]}</p>
    )
  }

  return (
    <ul className="mt-1.5 space-y-0.5">
      {lines.map((line, i) => (
        <li key={i} className="text-[11px] text-neutral-500 leading-snug flex gap-1.5">
          <span className="text-neutral-300 select-none">·</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

export function VersionsView({
  contract, onVersionClick, onDiscardDraft,
}: VersionsViewProps) {
  const { gitHistory } = contract
  const commits = [...gitHistory].reverse()
  const lastCommit = gitHistory[gitHistory.length - 1]

  const hasDraftRow = hasWorkingCopyDraft(contract)
  const canCompareCurrent = hasDraftRow && !!lastCommit?.snapshot

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

      <ContractSectionHeader
        title="Version history"
        metadataNote={
          gitHistory.length === 0
            ? VERSION_HISTORY_INTRO_EMPTY
            : versionHistoryIntroCount(gitHistory.length)
        }
      />

      {/* Empty state */}
      {!showTimeline && (
        <div className="border border-dashed border-[#d3d3e5] rounded-xl px-6 py-10 flex flex-col items-center gap-2.5 text-center bg-[#fbfbff]/40">
          <Clock className="h-5 w-5 text-[#656574]" aria-hidden />
          <p className="text-sm font-medium text-[#12131f]">No versions yet</p>
          <p className="text-xs text-[#656574] max-w-xs leading-relaxed">
            Each time you publish, a snapshot is saved here with a version number and description.
          </p>
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div>
          <div className="space-y-3">

            {/* Draft / working copy card */}
            {hasDraftRow && (() => {
              const versionComparison = canCompareCurrent
                ? summarizeChangesSince(contract, lastCommit!.snapshot!)
                : null
              const summaryLines = versionComparison
                ? buildWorkingCopySummaryLines(versionComparison)
                : []
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
                          <span className="text-sm font-semibold text-neutral-900">{VERSIONS_WORKING_COPY_LABEL}</span>
                        </div>
                        {versionComparison ? (
                          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug">
                            {summaryLines.length > 0
                              ? summaryLines.join(' · ')
                              : contract.inRevision
                                ? 'Revision open — no changes since last version'
                                : 'No changes since last version'}
                          </p>
                        ) : (
                          <p className="text-[11px] text-neutral-300 mt-1">{VERSIONS_CHANGES_NOT_PUBLISHED}</p>
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
                          'text-sm font-semibold',
                          isLatest ? 'text-neutral-900' : 'text-neutral-400'
                        )}>
                          {getCommitTitle(commit)}
                        </p>
                        <VersionChangelog text={getCommitChangelog(commit)} />
                        <div className="flex items-center gap-1.5 mt-1.5">
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
