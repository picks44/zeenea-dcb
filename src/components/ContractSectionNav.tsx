import { FileText, Database, Upload, Trash2, CheckCircle2, GitBranch, Users, Shield, Clock, AlertCircle } from 'lucide-react'
import { DataContract, SectionId } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import {
  NAV_DATA_ACCESS,
  NAV_FUNDAMENTALS,
  NAV_GOVERNANCE_CONTACTS,
  SECTION_GOVERNANCE_CONTACTS,
  NAV_IMPORT_SQL,
  NAV_SCHEMA,
  NAV_SERVICE_LEVELS,
  NAV_VERSIONS,
} from '@/lib/uxCopy'
import { useReadinessNavigation } from '@/components/readiness/ReadinessNavigationContext'
import type { SectionGuidanceStatus } from '@/lib/readinessGuidance'

interface ContractSectionNavProps {
  contract: DataContract
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
  isNew: boolean
  onDeleteContract?: () => void
  docCompact?: boolean
}

function statusCueTooltip(status: SectionGuidanceStatus, missingCount: number): string | null {
  if (status !== 'incomplete' || missingCount < 1) return null
  const noun = missingCount === 1 ? 'item' : 'items'
  return `${missingCount} required ${noun} missing`
}

function StatusIndicator({
  status,
  compact,
}: {
  status: SectionGuidanceStatus
  compact?: boolean
}) {
  const iconClass = compact ? 'h-3 w-3' : 'h-4 w-4'

  if (status === 'complete') {
    return <CheckCircle2 className={cn(iconClass, 'text-[#047800]')} aria-hidden />
  }
  if (status === 'incomplete') {
    return <AlertCircle className={cn(iconClass, 'text-[#b8956a]')} aria-hidden />
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" aria-hidden />
}

/** Fixed-width slot so labels stay aligned whether the cue is dot, check, or warning. */
function StatusCueSlot({
  status,
  compact,
}: {
  status: SectionGuidanceStatus
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        'flex items-center justify-center flex-shrink-0',
        compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
      )}
    >
      <StatusIndicator status={status} compact={compact} />
    </span>
  )
}

function navStatusForSection(
  id: SectionId,
  guidance: Partial<Record<SectionId, { status: SectionGuidanceStatus; missingCount: number }>>,
  contract: DataContract,
): { status: SectionGuidanceStatus; missingCount: number } {
  const g = guidance[id]
  if (g) return g
  if (id === 'import') {
    return contract.dataset.length > 0
      ? { status: 'complete', missingCount: 0 }
      : { status: 'empty', missingCount: 0 }
  }
  if (id === 'versions') {
    return { status: 'empty', missingCount: 0 }
  }
  return { status: 'empty', missingCount: 0 }
}

export function ContractSectionNav({
  activeSection,
  onSectionChange,
  isNew,
  onDeleteContract,
  docCompact,
  contract,
}: ContractSectionNavProps) {
  const nav = useReadinessNavigation()
  const guidance = nav?.sectionGuidance ?? {}

  const sections: { id: SectionId; label: string; icon: typeof FileText }[] = [
    ...(isNew ? [{ id: 'import' as SectionId, label: NAV_IMPORT_SQL, icon: Upload }] : []),
    { id: 'fundamentals', label: NAV_FUNDAMENTALS, icon: FileText },
    { id: 'schema',       label: NAV_SCHEMA,       icon: Database },
    { id: 'stakeholders', label: NAV_GOVERNANCE_CONTACTS, icon: Users },
    { id: 'accessRoles',  label: NAV_DATA_ACCESS,  icon: Shield },
    { id: 'sla',          label: NAV_SERVICE_LEVELS, icon: Clock },
    { id: 'versions',     label: NAV_VERSIONS,     icon: GitBranch },
  ]

  return (
    <div className="w-12 xl:w-48 flex-shrink-0 border-r border-[#d3d3e5] bg-white flex flex-col h-full">
      <div className="flex-1 px-1 xl:px-2 py-3 space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          const { status, missingCount } = navStatusForSection(id, guidance, contract)
          const navLabel = id === 'stakeholders' ? SECTION_GOVERNANCE_CONTACTS : label
          const rowLabel =
            status === 'incomplete' && missingCount > 0
              ? `${navLabel}, ${statusCueTooltip(status, missingCount)}`
              : navLabel

          const tooltipContent =
            status === 'incomplete' && missingCount > 0
              ? `${navLabel} — ${statusCueTooltip(status, missingCount)}`
              : navLabel

          return (
            <Tooltip key={id} content={tooltipContent} side="right" delayDuration={400}>
              <button
                onClick={() => onSectionChange(id)}
                className={cn(
                  'w-full flex items-center rounded text-left transition-colors tracking-[0.2px]',
                  'justify-center gap-1 xl:justify-start xl:gap-2',
                  docCompact
                    ? 'px-1 xl:pl-2 xl:pr-1.5 py-0.5 h-7 text-[13px]'
                    : 'px-1 xl:pl-2 xl:pr-1.5 py-1 h-8 text-sm',
                  isActive && 'bg-[#edf6ff] font-medium text-[#12131f]',
                  !isActive && 'text-[#12131f] hover:bg-[rgba(228,228,240,0.3)]',
                )}
                aria-label={rowLabel}
              >
                <Icon className={cn('flex-shrink-0 text-[#656574]', docCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                <span className="hidden xl:block flex-1 min-w-0 truncate">{label}</span>
                <span className="hidden xl:flex">
                  <StatusCueSlot status={status} />
                </span>
                <span className="xl:hidden">
                  <StatusCueSlot status={status} compact />
                </span>
              </button>
            </Tooltip>
          )
        })}
      </div>

      {onDeleteContract && (
        <div className="px-1 xl:px-2 pb-3 border-t border-[#e4e4f0] pt-2">
          <Tooltip content="Delete contract" side="right" delayDuration={400}>
            <button
              onClick={onDeleteContract}
              className="w-full flex items-center justify-center xl:justify-start gap-2 xl:pl-2 py-1 h-8 rounded text-sm tracking-[0.2px] text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] transition-colors"
              aria-label="Delete contract"
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xl:inline">Delete contract</span>
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
