import { FileText, Layers, PanelLeft, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppView } from '@/types/odcs'
import { Tooltip } from '@/components/ui/tooltip'
import logo from '@/assets/logo.png'

interface MainSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'backlog', label: 'Contracts', icon: FileText },
  ...(import.meta.env.DEV ? [{ id: 'components' as AppView, label: 'Components', icon: Layers }] : []),
]

export function MainSidebar({ currentView, onNavigate, collapsed, onToggleCollapsed }: MainSidebarProps) {
  const toggleLabel = collapsed ? 'Expand navigation' : 'Collapse navigation'

  return (
    <aside
      aria-expanded={!collapsed}
      className={cn(
        'flex-shrink-0 bg-white border-r border-[#d3d3e5] flex flex-col h-full overflow-hidden',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      <div
        className={cn(
          'h-11 flex items-center border-b border-[#e4e4f0] flex-shrink-0 gap-2.5',
          collapsed ? 'justify-center px-2' : 'justify-start px-4',
        )}
      >
        <img src={logo} alt="Actian logo" className="h-6 w-6 flex-shrink-0" />
        {!collapsed && (
          <span className="text-xs font-semibold text-[#12131f] leading-tight truncate">
            Data Contract<br />Builder
          </span>
        )}
      </div>

      <nav className={cn('flex-1 py-4 space-y-1', collapsed ? 'px-1.5' : 'px-4')}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id === 'backlog'
            ? currentView === 'backlog' || currentView === 'editor'
            : currentView === id
          return (
            <Tooltip key={id} content={label} side="right" delayDuration={400}>
              <button
                onClick={() => onNavigate(id)}
                className={cn(
                  'w-full flex items-center gap-2 py-1 h-8 rounded text-sm tracking-[0.2px] transition-colors',
                  collapsed ? 'justify-center' : 'justify-start',
                  isActive
                    ? cn(
                        'bg-blue-25 text-blue-700 font-medium border-l-2 border-blue-700',
                        !collapsed && 'pl-[6px]',
                      )
                    : cn('text-[#12131f] hover:bg-[rgba(228,228,240,0.3)]', !collapsed && 'pl-2'),
                )}
                aria-label={label}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-700' : 'text-[#656574]')} />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            </Tooltip>
          )
        })}
      </nav>

      <div className={cn('flex-shrink-0 border-t border-[#e4e4f0] py-2', collapsed ? 'px-1.5' : 'px-4')}>
        <Tooltip content={toggleLabel} side="right" delayDuration={400}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'w-full flex items-center gap-2 h-8 rounded text-sm text-[#656574]',
              'hover:bg-[rgba(228,228,240,0.3)] hover:text-[#12131f] transition-colors',
              collapsed ? 'justify-center' : 'justify-start pl-2',
            )}
            aria-label={toggleLabel}
          >
            {collapsed
              ? <PanelLeft className="h-4 w-4 flex-shrink-0" />
              : <PanelLeftClose className="h-4 w-4 flex-shrink-0" />}
            {!collapsed && <span className="truncate">Collapse</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
