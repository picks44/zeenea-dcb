import { FileText, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppView } from '@/types/odcs'
import logo from '@/assets/logo.png'

interface MainSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'backlog',    label: 'Contracts',  icon: FileText },
  { id: 'components', label: 'Components', icon: Layers   },
]

export function MainSidebar({ currentView, onNavigate }: MainSidebarProps) {
  return (
    <div className="w-[224px] flex-shrink-0 bg-white border-r border-[#d3d3e5] flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 h-11 flex items-center gap-2.5 border-b border-[#e4e4f0] flex-shrink-0">
        <img src={logo} alt="Actian logo" className="h-6 w-6 flex-shrink-0" />
        <span className="text-xs font-semibold text-[#12131f] leading-tight">
          Data Contract<br />Builder
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id === 'backlog'
            ? currentView === 'backlog' || currentView === 'editor'
            : currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                'w-full flex items-center gap-2 py-1 h-8 rounded text-left transition-colors text-sm tracking-[0.2px]',
                isActive
                  ? 'bg-blue-25 text-blue-700 font-medium border-l-2 border-blue-700 pl-[6px]'
                  : 'text-[#12131f] hover:bg-[rgba(228,228,240,0.3)] pl-2'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-700' : 'text-[#656574]')} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
