import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, X, Check, Upload,
  Loader2, AlertCircle, Plus, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataContract, GitCommit } from '@/types/odcs'
import { validateContract } from '@/lib/contractValidation'
import { validationUserMessage } from '@/lib/validationUserMessages'
import {
  PUBLISH_EXTERNAL_SYNC_NOTE,
  PUBLISH_MODAL_SUBTITLE,
  PUBLISH_STEP_CHANGES_PREPARED,
  PUBLISH_STEP_PREPARING,
  PUBLISH_STEP_SAVING_VERSION,
  PUBLISH_STEP_VERSION_SAVED,
  publishStepUpdatingVersion,
} from '@/lib/uxCopy'
import { buildPublishChangelog, summarizeExportChangesSince } from '@/lib/exportedContractDiff'
import { publishCommitTitle } from '@/lib/versionHistory'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomHash(): string {
  return Math.random().toString(16).slice(2, 9)
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function bumpVersion(version: string, type: BumpType): string {
  const [maj, min, pat] = version.split('.').map(Number)
  if (type === 'major') return `${maj + 1}.0.0`
  if (type === 'minor') return `${maj}.${min + 1}.0`
  return `${maj}.${min}.${pat + 1}`
}

// ─── Result type ─────────────────────────────────────────────────────────────

export interface PushResult {
  commit: GitCommit
  newVersion: string
}

// ─── Phase types ─────────────────────────────────────────────────────────────

type Phase =
  | { kind: 'form' }
  | { kind: 'loading'; steps: string[]; current: number }
  | { kind: 'pushed'; result: PushResult }

// ─── Bump config ──────────────────────────────────────────────────────────────

const BUMP_CONFIG = {
  minor: {
    label: 'Update',
    desc: 'New fields added, nothing removed — existing consumers unaffected',
    icon: Plus,
    selectedBorder: 'border-blue-300',
    selectedBg: 'from-blue-50/80 to-white',
    ring: 'ring-[#99cde8]',
    iconBg: 'bg-[#cfeafd]',
    iconColor: 'text-[#00699f]',
    labelColor: 'text-[#00699f]',
    versionColor: 'text-[#003d5c]',
    descColor: 'text-[#00699f]/80',
  },
  major: {
    label: 'Breaking',
    desc: 'Fields removed or renamed — consumers will need to update',
    icon: Zap,
    selectedBorder: 'border-rose-300',
    selectedBg: 'from-rose-50/80 to-white',
    ring: 'ring-[#ffb09b]',
    iconBg: 'bg-[#ffdacf]',
    iconColor: 'text-[#c12c11]',
    labelColor: 'text-[#c12c11]',
    versionColor: 'text-[#8b1a09]',
    descColor: 'text-[#c12c11]/80',
  },
} as const

type BumpType = keyof typeof BUMP_CONFIG

// ─── Bump card ────────────────────────────────────────────────────────────────

function BumpCard({
  type, current, selected, onClick,
}: {
  type: BumpType
  current: string
  selected: boolean
  onClick: () => void
}) {
  const cfg = BUMP_CONFIG[type]
  const Icon = cfg.icon
  const next = bumpVersion(current, type)

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all text-center relative overflow-hidden',
        selected
          ? `${cfg.selectedBorder} bg-gradient-to-b ${cfg.selectedBg} ring-2 ${cfg.ring} ring-offset-1`
          : 'border-[#d3d3e5] bg-white hover:border-[#d3d3e5] hover:bg-[#f5f5fa]/70',
      )}
    >
      <div className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
        selected ? cn(cfg.iconBg, cfg.iconColor) : 'bg-[#f5f5fa] text-[#656574]'
      )}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="space-y-0.5">
        <p className={cn(
          'text-[10px] font-bold uppercase tracking-widest',
          selected ? cfg.labelColor : 'text-[#656574]'
        )}>
          {cfg.label}
        </p>
        <p className={cn(
          'font-mono font-bold transition-all',
          selected ? cn('text-base', cfg.versionColor) : 'text-sm text-[#656574]'
        )}>
          {next}
        </p>
        <p className="font-mono text-[10px] text-[#9898a7] line-through">{current}</p>
      </div>

      <p className={cn(
        'text-[10px] leading-snug',
        selected ? cfg.descColor : 'text-[#656574]'
      )}>
        {cfg.desc}
      </p>

      {selected && (
        <div className={cn(
          'absolute top-2 right-2 h-4 w-4 rounded-full flex items-center justify-center',
          cfg.iconBg
        )}>
          <Check className={cn('h-2.5 w-2.5', cfg.iconColor)} />
        </div>
      )}
    </button>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Step({ label, state }: { label: string; state: 'pending' | 'active' | 'done' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
        state === 'done'    && 'bg-[#d3efcd]',
        state === 'active'  && 'bg-[#d0e8fd]',
        state === 'pending' && 'bg-[#f5f5fa]',
      )}>
        {state === 'done'    && <Check className="h-3 w-3 text-[#047800]" />}
        {state === 'active'  && <Loader2 className="h-3 w-3 text-[#0550dc] animate-spin" />}
        {state === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" />}
      </div>
      <span className={cn(
        'text-xs',
        state === 'done'    && 'text-[#656574] line-through',
        state === 'active'  && 'text-[#2a2a30] font-medium',
        state === 'pending' && 'text-[#656574]',
      )}>
        {label}
      </span>
    </div>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

interface PushToGitModalProps {
  contract: DataContract
  open: boolean
  onClose: () => void
  onPushed: (result: PushResult) => void
}

export function PushToGitModal({ contract, open, onClose, onPushed }: PushToGitModalProps) {
  const [phase, setPhase] = useState<Phase>({ kind: 'form' })
  const [bumpType, setBumpType] = useState<BumpType>('minor')
  const [description, setDescription] = useState('')
  const descRef = useRef<HTMLTextAreaElement>(null)

  const isFirstPublish = contract.gitHistory.length === 0
  const newVersion = isFirstPublish ? contract.info.version : bumpVersion(contract.info.version, bumpType)
  const fieldCount = contract.dataset.reduce((a, t) => a + t.columns.length, 0)
  const validationWarnings = validateContract(contract).warnings

  useEffect(() => {
    if (!open) return
    setPhase({ kind: 'form' })
    setBumpType('minor')

    const firstPublish = contract.gitHistory.length === 0
    let initialDescription = ''
    if (!firstPublish) {
      const lastCommit = contract.gitHistory[contract.gitHistory.length - 1]
      if (lastCommit?.snapshot) {
        initialDescription = buildPublishChangelog(
          summarizeExportChangesSince(contract, lastCommit.snapshot),
        )
      }
    }
    setDescription(initialDescription)

    setTimeout(() => descRef.current?.focus(), 80)
  }, [open, contract.uid])

  if (!open) return null

  const handlePush = async () => {
    const hash = randomHash()
    const now = new Date().toISOString()
    const title = publishCommitTitle(newVersion, contract.info.title, isFirstPublish)
    const changelog = description.trim()

    const commit: GitCommit = {
      hash,
      title,
      changelog,
      timestamp: now,
      version: newVersion,
      contractStatus: 'active',
    }

    const result: PushResult = { commit, newVersion }

    const steps = [
      PUBLISH_STEP_PREPARING,
      publishStepUpdatingVersion(newVersion),
      PUBLISH_STEP_SAVING_VERSION,
    ]
    setPhase({ kind: 'loading', steps, current: 0 })
    await delay(480)
    setPhase({ kind: 'loading', steps, current: 1 })
    await delay(560)
    setPhase({ kind: 'loading', steps, current: 2 })
    await delay(640)
    onPushed(result)
    setPhase({ kind: 'pushed', result })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e4f0]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#12131f] flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#12131f] text-sm leading-tight">
                {isFirstPublish ? 'Publish first version' : 'Publish new version'}
              </p>
              <p className="text-[11px] text-[#656574] leading-tight">{PUBLISH_MODAL_SUBTITLE}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-5 space-y-5">

          {/* ── Form ── */}
          {phase.kind === 'form' && (
            <>
              {/* Contract summary */}
              <div className="flex items-center gap-3 bg-[#fbfbff] rounded-lg px-3 py-2.5 border border-[#e4e4f0]">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#33333d] truncate">
                    {contract.info.title || 'Untitled Contract'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-[#656574]">v{contract.info.version}</span>
                    {fieldCount > 0 && (
                      <span className="text-[10px] text-[#656574]">{fieldCount} field{fieldCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>

              {validationWarnings.length > 0 && (
                <div className="bg-[#fff8ec] border border-[#ffd599] rounded-lg px-3 py-2.5 space-y-1">
                  <p className="text-[11px] font-semibold text-[#d27b00]">Recommendations</p>
                  {validationWarnings.map(w => (
                    <p key={w.code} className="text-[11px] text-[#3f3f4a] leading-snug">
                      {validationUserMessage(w)}
                    </p>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#656574] mb-1.5">
                  What changed?
                </label>
                <textarea
                  ref={descRef}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={isFirstPublish
                    ? 'e.g. Initial version with user and order tables'
                    : 'e.g. Added billing_date field, updated PII flags'}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#d3d3e5] bg-white px-3 py-2 text-sm text-[#12131f] placeholder:text-[#9898a7] focus:outline-none focus:border-2 focus:border-blue-700 transition-colors leading-snug"
                />
              </div>

              {/* First publish: no bump selection */}
              {isFirstPublish ? (
                <div className="bg-[#f0ffec] border border-[#b8dfb5] rounded-xl px-4 py-3.5 text-center">
                  <p className="text-sm font-semibold text-emerald-800">
                    Will be published as{' '}
                    <span className="font-mono bg-[#d3efcd] px-1.5 py-0.5 rounded">v{newVersion}</span>
                  </p>
                  <p className="text-[11px] text-[#047800] mt-1">
                    This is the first version — it will become active immediately.
                  </p>
                </div>
              ) : (
                /* Revision: choose Minor or Major */
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#656574] mb-3">
                    What type of change is this?
                  </p>
                  <div className="flex gap-2">
                    {(['minor', 'major'] as BumpType[]).map(t => (
                      <BumpCard
                        key={t}
                        type={t}
                        current={contract.info.version}
                        selected={bumpType === t}
                        onClick={() => setBumpType(t)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Loading ── */}
          {phase.kind === 'loading' && (
            <div className="py-4 space-y-3">
              {phase.steps.map((step, i) => (
                <Step
                  key={step}
                  label={step}
                  state={i < phase.current ? 'done' : i === phase.current ? 'active' : 'pending'}
                />
              ))}
            </div>
          )}

          {/* ── Success ── */}
          {phase.kind === 'pushed' && (
            <div className="py-2 space-y-4">
              <div className="space-y-2">
                <Step label={PUBLISH_STEP_CHANGES_PREPARED} state="done" />
                <Step label={publishStepUpdatingVersion(phase.result.newVersion)} state="done" />
                <Step label={PUBLISH_STEP_VERSION_SAVED} state="done" />
              </div>
              <div className="bg-[#f0ffec] border border-[#b8dfb5] rounded-xl px-4 py-3 flex items-center gap-3">
                <Check className="h-4 w-4 text-[#047800] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#047800]">
                    Published as{' '}
                    <span className="font-mono bg-[#d3efcd] px-1.5 py-0.5 rounded">
                      v{phase.result.newVersion}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#3f3f4a] mt-0.5 truncate">
                    {phase.result.commit.title}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#656574] flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                {PUBLISH_EXTERNAL_SYNC_NOTE}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e4e4f0] bg-[#fbfbff]/80">
          {phase.kind === 'form' && (
            <>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handlePush} className="h-8 text-xs gap-1.5 bg-[#12131f] hover:bg-[#2a2a30]">
                <Upload className="h-3.5 w-3.5" />
                Publish v{newVersion}
              </Button>
            </>
          )}

          {phase.kind === 'loading' && (
            <div className="flex-1 flex justify-center">
              <span className="text-xs text-[#656574]">Please wait…</span>
            </div>
          )}

          {phase.kind === 'pushed' && (
            <>
              <div />
              <Button size="sm" onClick={onClose} className="h-8 text-xs">Done</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
