import { FileText, Database, Upload, Trash2, CheckCircle2, GitBranch, Users, Shield, Clock } from 'lucide-react'
import { DataContract, SectionId } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface ContractSectionNavProps {
  contract: DataContract
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
  isNew: boolean
  onDeleteContract?: () => void
}

function sectionCompletion(contract: DataContract): Record<SectionId, 'complete' | 'partial' | 'empty'> {
  const { info, id, dataset, stakeholders, roles, slaProperties } = contract
  const hasTitle = !!info.title.trim()
  const hasOwner = !!info.owner.trim()
  const hasId = !!id.trim()

  return {
    import: dataset.length > 0 ? 'complete' : 'empty',
    fundamentals: hasTitle && hasOwner && hasId ? 'complete' : hasTitle || hasOwner ? 'partial' : 'empty',
    schema: dataset.length > 0 && dataset.some(t => t.columns.length > 0) ? 'complete' : dataset.length > 0 ? 'partial' : 'empty',
    stakeholders: stakeholders.length > 0 ? 'complete' : 'empty',
    accessRoles: (roles?.length ?? 0) > 0 ? 'complete' : 'empty',
    sla: (slaProperties?.length ?? 0) > 0 ? 'complete' : 'empty',
    versions: 'empty',
    terms: 'empty', servers: 'empty', team: 'empty',
    pricing: 'empty', custom: 'empty',
    collaboration: 'empty', tests: 'empty',
  }
}

export function ContractSectionNav({
  contract,
  activeSection,
  onSectionChange,
  isNew,
  onDeleteContract,
}: ContractSectionNavProps) {
  const completion = sectionCompletion(contract)

  const sections: { id: SectionId; label: string; icon: typeof FileText }[] = [
    ...(isNew ? [{ id: 'import' as SectionId, label: 'Import SQL', icon: Upload }] : []),
    { id: 'fundamentals', label: 'Fundamentals', icon: FileText },
    { id: 'schema',       label: 'Schema',       icon: Database },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'accessRoles',  label: 'Data access',  icon: Shield },
    { id: 'sla',          label: 'Service levels', icon: Clock },
    { id: 'versions',     label: 'Versions',     icon: GitBranch },
  ]

  return (
    <div className="w-12 xl:w-48 flex-shrink-0 border-r border-[#d3d3e5] bg-white flex flex-col h-full">
      <div className="flex-1 px-1 xl:px-2 py-3 space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          const status = completion[id]

          return (
            <Tooltip key={id} content={label} side="right" delayDuration={400}>
              <button
                onClick={() => onSectionChange(id)}
                className={cn(
                  'w-full flex items-center justify-center xl:justify-start gap-2 px-1 xl:pl-2 xl:pr-2 py-1 h-8 rounded text-left transition-colors text-sm tracking-[0.2px] text-[#12131f]',
                  isActive
                    ? 'bg-[#edf6ff] font-medium'
                    : 'hover:bg-[rgba(228,228,240,0.3)]',
                )}
                aria-label={label}
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-[#656574]" />
                <span className="hidden xl:block flex-1 truncate">{label}</span>
                {status === 'complete' && (
                  <CheckCircle2 className="h-4 w-4 text-[#047800] flex-shrink-0 hidden xl:block" />
                )}
                {status === 'partial' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d27b00] flex-shrink-0 hidden xl:block" />
                )}
                {status === 'complete' && (
                  <CheckCircle2 className="h-3 w-3 text-[#047800] flex-shrink-0 xl:hidden" />
                )}
                {status === 'partial' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d27b00] flex-shrink-0 xl:hidden" />
                )}
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
