import { FileText, Code2, Upload, Check, AlertCircle, GitBranch, Users, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { DataContract, EditorTab, Collaborator, CollaboratorRole } from '@/types/odcs'
import { MEMBER_ROLE_LABELS, PUBLISH_REQUIRES_PUBLISHER_CONTRACT } from '@/lib/uxCopy'
import { cn } from '@/lib/utils'

interface ContractTopBarProps {
  contract: DataContract
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  canPublish: boolean
  publishBlockReason: string | null
  onPushToGit: () => void
  onNewVersion: () => void
  collaborators: Collaborator[]
  onShare: () => void
  myRole: CollaboratorRole
  /** Show Readiness/Quality toggle when panel is not pinned (below xl). */
  showReadinessToggle?: boolean
  readinessToggleLabel?: string
  readinessPanelOpen?: boolean
  onReadinessToggle?: () => void
}

const TABS: { id: EditorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'form', label: 'Form', icon: FileText },
  { id: 'yaml', label: 'YAML', icon: Code2    },
]

const AVATAR_PALETTE = [
  'bg-[#ecffff]', 'bg-[#d0efed]', 'bg-[#dde6ec]',
  'bg-[#eed7ff]', 'bg-[#ffd5dd]', 'bg-[#d3efcd]',
  'bg-[#ffdacf]', 'bg-[#ffebce]',
]

function avatarBg(email: string): string {
  let h = 0
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

function getInitials(name: string): string {
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

export function ContractTopBar({
  contract, activeTab, onTabChange,
  canPublish, publishBlockReason, onPushToGit, onNewVersion,
  collaborators, onShare, myRole,
  showReadinessToggle,
  readinessToggleLabel,
  readinessPanelOpen,
  onReadinessToggle,
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

  return (
    <div className="h-11 bg-white border-b border-[#d3d3e5] flex items-center px-3 xl:px-4 gap-2 xl:gap-3 flex-shrink-0 min-w-0">

      <div className="flex items-center gap-2 min-w-0 flex-shrink">
        <span className="font-semibold text-[#12131f] text-sm truncate max-w-[120px] md:max-w-[180px] xl:max-w-[240px]">
          {info.title || 'Untitled Contract'}
        </span>
        <Badge variant={info.status}>{info.status.charAt(0).toUpperCase() + info.status.slice(1)}</Badge>
        <Badge variant="version" className="flex-shrink-0">v{info.version}</Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border border-[#d3d3e5] rounded-lg overflow-hidden flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }, i) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-all',
              i > 0 && 'border-l border-[#d3d3e5]',
              activeTab === id
                ? 'bg-[#0550dc] text-white'
                : 'bg-white text-[#3f3f4a] hover:bg-[#fbfbff] hover:text-[#33333d]'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-2" />

      {!isConsumer && (
        <>
          {showReadinessToggle && onReadinessToggle && (
            <Button
              variant={readinessPanelOpen ? 'secondary' : 'outline'}
              size="sm"
              onClick={onReadinessToggle}
              className="gap-1.5 xl:hidden flex-shrink-0"
            >
              <Gauge className="h-3.5 w-3.5" />
              {readinessToggleLabel ?? 'Readiness'}
            </Button>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {collaborators.length > 0 && (
              <div className="flex items-center -space-x-1">
                {collaborators.slice(0, 3).map(c => (
                  <Tooltip
                    key={c.id}
                    content={<><div>{c.name}</div><div className="text-[10px] opacity-60 mt-0.5">{MEMBER_ROLE_LABELS[c.role]}</div></>}
                    side="bottom"
                    delayDuration={300}
                  >
                    <div className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center text-[#12131f] text-[10px] font-medium ring-1 ring-white flex-shrink-0 cursor-default',
                      avatarBg(c.email)
                    )}>
                      {getInitials(c.name)}
                    </div>
                  </Tooltip>
                ))}
                {collaborators.length > 3 && (
                  <Tooltip content={`${collaborators.length - 3} more members`} side="bottom" delayDuration={300}>
                    <div className="h-6 w-6 rounded-full bg-[#f5f5fa] text-[#656574] text-[10px] font-medium flex items-center justify-center ring-1 ring-white flex-shrink-0 cursor-default">
                      +{collaborators.length - 3}
                    </div>
                  </Tooltip>
                )}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onShare} className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Members</span>
            </Button>
          </div>

          {/* Actions area */}
          {info.status !== 'deprecated' && (
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* New version — owner + contributor on active contracts */}
              {(isOwner || isContributor) && info.status === 'active' && !contract.inRevision && (
                <Button variant="secondary" size="sm" onClick={onNewVersion} className="gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" />
                  New version
                </Button>
              )}

              {/* Publish area — draft / in-revision state */}
              {(info.status === 'draft' || contract.inRevision) && (gitState === 'never' || gitState === 'unpushed') && (
                isOwner ? (
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
                ) : (
                  <Tooltip content={PUBLISH_REQUIRES_PUBLISHER_CONTRACT} side="bottom" delayDuration={300}>
                    <span>
                      <Button size="sm" disabled className="h-8 text-xs gap-1.5 pointer-events-none">
                        <Upload className="h-3.5 w-3.5" />
                        {gitState === 'never' ? 'Publish' : 'Publish update'}
                      </Button>
                    </span>
                  </Tooltip>
                )
              )}

              {/* Synced / published state — owner only */}
              {isOwner && (info.status === 'draft' || contract.inRevision) && gitState === 'synced' && (
                <Button variant="ghost" size="sm" onClick={onPushToGit} title={`Published · ${lastCommit!.hash}`} className="gap-1.5 text-neutral-400">
                  <Check className="h-3.5 w-3.5 text-green-700" />
                  Published
                </Button>
              )}

              {/* PR open — owner only */}
              {isOwner && gitState === 'pr-open' && (
                <Button variant="warning" size="sm" className="gap-1.5 pointer-events-none">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Review pending
                </Button>
              )}

            </div>
          )}
        </>
      )}

    </div>
  )
}
