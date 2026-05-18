import { FileText, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppView } from '@/types/odcs'
import { Tooltip } from '@/components/ui/tooltip'
import logo from '@/assets/logo.png'

interface MainSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'backlog', label: 'Contracts', icon: FileText },
  ...(import.meta.env.DEV ? [{ id: 'components' as AppView, label: 'Components', icon: Layers }] : []),
]

export function MainSidebar({ currentView, onNavigate }: MainSidebarProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 bg-white border-r border-[#d3d3e5] flex flex-col h-full',
        'w-14 xl:w-56',
      )}
    >
      <div className="px-2 xl:px-4 h-11 flex items-center justify-center xl:justify-start gap-2.5 border-b border-[#e4e4f0] flex-shrink-0">
        <img src={logo} alt="Actian logo" className="h-6 w-6 flex-shrink-0" />
        <span className="hidden xl:block text-xs font-semibold text-[#12131f] leading-tight">
          Data Contract<br />Builder
        </span>
      </div>

      <nav className="flex-1 px-1.5 xl:px-4 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id === 'backlog'
            ? currentView === 'backlog' || currentView === 'editor'
            : currentView === id
          return (
            <Tooltip key={id} content={label} side="right" delayDuration={400}>
              <button
                onClick={() => onNavigate(id)}
                className={cn(
                  'w-full flex items-center justify-center xl:justify-start gap-2 py-1 h-8 rounded text-sm tracking-[0.2px] transition-colors',
                  isActive
                    ? 'bg-blue-25 text-blue-700 font-medium border-l-2 border-blue-700 xl:pl-[6px]'
                    : 'text-[#12131f] hover:bg-[rgba(228,228,240,0.3)] xl:pl-2',
                )}
                aria-label={label}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-700' : 'text-[#656574]')} />
                <span className="hidden xl:inline truncate">{label}</span>
              </button>
            </Tooltip>
          )
        })}
      </nav>
    </div>
  )
}
