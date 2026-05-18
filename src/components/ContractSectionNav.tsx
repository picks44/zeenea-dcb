import { FileText, Database, Upload, Trash2, CheckCircle2, GitBranch } from 'lucide-react'
import { DataContract, SectionId } from '@/types/odcs'
import { cn } from '@/lib/utils'

interface ContractSectionNavProps {
  contract: DataContract
  activeSection: SectionId
  onSectionChange: (section: SectionId) => void
  isNew: boolean
  onDeleteContract?: () => void
}

function sectionCompletion(contract: DataContract): Record<SectionId, 'complete' | 'partial' | 'empty'> {
  const { info, id, dataset, stakeholders } = contract
  const hasTitle = !!info.title.trim()
  const hasOwner = !!info.owner.trim()
  const hasId = !!id.trim()

  return {
    import: dataset.length > 0 ? 'complete' : 'empty',
    fundamentals: hasTitle && hasOwner && hasId ? 'complete' : hasTitle || hasOwner ? 'partial' : 'empty',
    schema: dataset.length > 0 && dataset[0].columns.length > 0 ? 'complete' : dataset.length > 0 ? 'partial' : 'empty',
    stakeholders: stakeholders.length > 0 ? 'complete' : 'empty',
    terms: 'empty', servers: 'empty', team: 'empty',
    sla: 'empty', pricing: 'empty', custom: 'empty',
    collaboration: 'empty', tests: 'empty', versions: 'empty',
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
    { id: 'versions',     label: 'Versions',     icon: GitBranch },
  ]

  return (
    <div className="w-[192px] flex-shrink-0 border-r border-[#d3d3e5] bg-white flex flex-col h-full">
      <div className="flex-1 px-2 py-3 space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          const status = completion[id]

          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={cn(
                'w-full flex items-center gap-2 pl-2 pr-2 py-1 h-8 rounded text-left transition-colors text-sm tracking-[0.2px] text-[#12131f]',
                isActive
                  ? 'bg-[#edf6ff] font-medium'
                  : 'hover:bg-[rgba(228,228,240,0.3)]'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-[#656574]" />
              <span className="flex-1 truncate">{label}</span>
              {status === 'complete' && (
                <CheckCircle2 className="h-4 w-4 text-[#047800] flex-shrink-0" />
              )}
              {status === 'partial' && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#d27b00] flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {onDeleteContract && (
        <div className="px-2 pb-3 border-t border-[#e4e4f0] pt-2">
          <button
            onClick={onDeleteContract}
            title="Delete contract"
            className="w-full flex items-center gap-2 pl-2 py-1 h-8 rounded text-left text-sm tracking-[0.2px] text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] transition-colors"
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            Delete contract
          </button>
        </div>
      )}
    </div>
  )
}
