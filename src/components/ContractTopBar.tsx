import {
  FileText,
  Code2,
  Upload,
  Check,
  AlertCircle,
  GitBranch,
  Users,
  Gauge,
  PenLine,
  AlertTriangle,
  ArchiveX,
} from 'lucide-react'
import { LifecycleStatusBadge, RevisionOpenBadge } from '@/lib/lifecycleStatusUi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'
import { Avatar } from '@/components/ui/avatar'
import { DataContract, EditorTab, Collaborator, CollaboratorRole } from '@/types/odcs'
import {
  COLLABORATOR_ROLE_LABELS,
  COLLABORATORS_MODAL_TITLE,
  COLLABORATORS_MORE_COUNT,
  PUBLISH_REQUIRES_PUBLISHER_CONTRACT,
  TOP_BAR_APPROVAL_IN_PROGRESS,
  topBarPublishedTooltip,
} from '@/lib/uxCopy'
import { useReadinessNavigation } from '@/components/readiness/ReadinessNavigationContext'
import { cn } from '@/lib/utils'

interface ContractTopBarProps {
  contract: DataContract
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  canPublish: boolean
  publishBlockReason: string | null
  onPushToGit: () => void
  onNewVersion: () => void
  onStartDraft: () => void
  onDeprecate: () => void
  onRetire: () => void
  collaborators: Collaborator[]
  onShare: () => void
  myRole: CollaboratorRole
  /** Show Readiness/Quality toggle when panel is not pinned (below xl). */
  showReadinessToggle?: boolean
  readinessToggleLabel?: string
  readinessPanelOpen?: boolean
  onReadinessToggle?: () => void
  /** Hide while on initial Import step for new import-sourced contracts. */
  hideStartDrafting?: boolean
}

/** Shared height for badges, tabs, and actions in the contract top bar (32px). */
const TOP_BAR_CONTROL = 'h-8 shrink-0 text-xs'
const TOP_BAR_BTN = cn(TOP_BAR_CONTROL, 'gap-1.5 px-3')

const TABS: { id: EditorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'form', label: 'Form', icon: FileText },
  { id: 'yaml', label: 'YAML', icon: Code2    },
]

export function ContractTopBar({
  contract, activeTab, onTabChange,
  canPublish, publishBlockReason, onPushToGit, onNewVersion, onStartDraft, onDeprecate, onRetire,
  collaborators, onShare, myRole,
  showReadinessToggle,
  readinessToggleLabel,
  readinessPanelOpen,
  onReadinessToggle,
  hideStartDrafting = false,
}: ContractTopBarProps) {
  const { info, gitHistory, openPR } = contract

  const lastCommit = gitHistory.length > 0 ? gitHistory[gitHistory.length - 1] : null
  const hasUnpushed = !lastCommit || new Date(contract.updatedAt) > new Date(lastCommit.timestamp)
  const gitState: 'never' | 'synced' | 'unpushed' | 'pr-open' =
    openPR?.status === 'open' ? 'pr-open' :
    !lastCommit ? 'never' :
    hasUnpushed ? 'unpushed' : 'synced'

  const isConsumer    = myRole === 'viewer'
  const isContributor = myRole === 'editor'
  const isOwner       = myRole === 'owner'
  const readinessNav = useReadinessNavigation()

  const handlePublishClick = () => {
    readinessNav?.markPublishAttempted()
    if (!canPublish) return
    onPushToGit()
  }

  return (
    <div className="h-11 bg-white border-b border-neutral-200 flex items-center px-3 xl:px-4 gap-2 xl:gap-3 flex-shrink-0 min-w-0">

      <div className="flex h-8 items-center gap-2 min-w-0 flex-shrink">
        <span className="font-semibold text-neutral-900 text-sm leading-none truncate max-w-[120px] md:max-w-[180px] xl:max-w-[240px]">
          {info.title || 'Untitled Contract'}
        </span>
        <LifecycleStatusBadge status={info.status} />
        <Badge variant="version">v{info.version}</Badge>
        {contract.inRevision && <RevisionOpenBadge />}
      </div>

      <div className="flex-1 min-w-2" />

      <div className="flex h-8 items-center gap-2 xl:gap-3 flex-shrink-0 min-w-0">
        {!isConsumer && showReadinessToggle && onReadinessToggle && (
          <Button
            variant={readinessPanelOpen ? 'secondary' : 'outline'}
            size="sm"
            onClick={onReadinessToggle}
            className={cn(TOP_BAR_BTN, 'xl:hidden')}
          >
            <Gauge className="h-3.5 w-3.5" />
            {readinessToggleLabel ?? 'Readiness'}
          </Button>
        )}

        <Tabs value={activeTab} onValueChange={v => onTabChange(v as EditorTab)} className="flex-shrink-0">
          <TabsList className={TOP_BAR_CONTROL}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {!isConsumer && (
          <>
            <div className="flex h-8 items-center gap-2 flex-shrink-0">
            {collaborators.length > 0 && (
              <div className="flex h-8 items-center -space-x-1">
                {collaborators.slice(0, 3).map(c => (
                  <Tooltip
                    key={c.id}
                    content={<><div>{c.name}</div><div className="text-[10px] opacity-60 mt-0.5">{COLLABORATOR_ROLE_LABELS[c.role]}</div></>}
                    side="bottom"
                    delayDuration={300}
                  >
                    <Avatar name={c.name} size="sm" className="cursor-default" />
                  </Tooltip>
                ))}
                {collaborators.length > 3 && (
                  <Tooltip content={COLLABORATORS_MORE_COUNT(collaborators.length - 3)} side="bottom" delayDuration={300}>
                    <div className="h-6 w-6 rounded-full bg-neutral-50 text-neutral-400 text-[10px] font-medium flex items-center justify-center ring-1 ring-white flex-shrink-0 cursor-default">
                      +{collaborators.length - 3}
                    </div>
                  </Tooltip>
                )}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onShare} className={TOP_BAR_BTN}>
              <Users className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{COLLABORATORS_MODAL_TITLE}</span>
            </Button>
          </div>

          {/* Actions area */}
          {info.status !== 'deprecated' && info.status !== 'retired' && (
            <div className="flex h-8 items-center gap-2 flex-shrink-0">

              {(isOwner || isContributor) && info.status === 'proposed' && !hideStartDrafting && (
                <Button variant="secondary" size="sm" onClick={onStartDraft} className={TOP_BAR_BTN}>
                  <PenLine className="h-3.5 w-3.5" />
                  Start drafting
                </Button>
              )}

              {/* New version - owner + contributor on active contracts */}
              {(isOwner || isContributor) && info.status === 'active' && !contract.inRevision && (
                <>
                  <Button variant="secondary" size="sm" onClick={onNewVersion} className={TOP_BAR_BTN}>
                    <GitBranch className="h-3.5 w-3.5" />
                    New version
                  </Button>
                  {isOwner && (
                    <Button variant="outline" size="sm" onClick={onDeprecate} className={TOP_BAR_BTN}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Deprecate
                    </Button>
                  )}
                </>
              )}

              {/* Publish area - draft / in-revision state */}
              {(info.status === 'draft' || contract.inRevision) && (gitState === 'never' || gitState === 'unpushed') && (
                isOwner ? (
                  <Tooltip
                    content={!canPublish && publishBlockReason ? publishBlockReason : undefined}
                    side="bottom"
                    delayDuration={300}
                  >
                    <Button
                      type="button"
                      size="sm"
                      onClick={handlePublishClick}
                      aria-disabled={!canPublish}
                      className={cn(
                        TOP_BAR_BTN,
                        !canPublish &&
                          'bg-neutral-50 text-neutral-300 border border-neutral-200 shadow-none cursor-not-allowed hover:bg-neutral-50 hover:text-neutral-300',
                      )}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {gitState === 'never' ? 'Publish' : 'Publish update'}
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip content={PUBLISH_REQUIRES_PUBLISHER_CONTRACT} side="bottom" delayDuration={300}>
                    <span>
                      <Button size="sm" disabled className={cn(TOP_BAR_BTN, 'pointer-events-none')}>
                        <Upload className="h-3.5 w-3.5" />
                        {gitState === 'never' ? 'Publish' : 'Publish update'}
                      </Button>
                    </span>
                  </Tooltip>
                )
              )}

              {/* Synced / published state - owner only */}
              {isOwner && (info.status === 'draft' || contract.inRevision) && gitState === 'synced' && (
                <Button variant="ghost" size="sm" onClick={onPushToGit} title={topBarPublishedTooltip(lastCommit!.version)} className={cn(TOP_BAR_BTN, 'text-neutral-400')}>
                  <Check className="h-3.5 w-3.5 text-green-700" />
                  Published
                </Button>
              )}

              {/* Approval request open - owner only (simulated; openPR unused in seed data) */}
              {isOwner && gitState === 'pr-open' && (
                <Button variant="warning" size="sm" className={cn(TOP_BAR_BTN, 'pointer-events-none')}>
                  <AlertCircle className="h-3.5 w-3.5" />
                  {TOP_BAR_APPROVAL_IN_PROGRESS}
                </Button>
              )}

            </div>
          )}

            {isOwner && info.status === 'deprecated' && (
              <Button variant="outline" size="sm" onClick={onRetire} className={TOP_BAR_BTN}>
                <ArchiveX className="h-3.5 w-3.5" />
                Retire contract
              </Button>
            )}
          </>
        )}
      </div>

    </div>
  )
}
