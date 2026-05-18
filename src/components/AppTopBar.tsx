import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'
import { UserMenu } from './UserMenu'
import { AppView } from '@/types/odcs'

interface AppTopBarProps {
  currentView: AppView
  contractTitle?: string
  onBack: () => void
}

export function AppTopBar({ currentView, contractTitle, onBack }: AppTopBarProps) {
  const items: BreadcrumbItem[] =
    currentView === 'editor'
      ? [{ label: 'Contracts', onClick: onBack }, { label: contractTitle || 'Untitled Contract' }]
      : currentView === 'components'
      ? [{ label: 'Components' }]
      : [{ label: 'Contracts' }]

  return (
    <div className="h-11 bg-white border-b border-[#d3d3e5] flex items-center px-4 gap-2 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <Breadcrumb items={items} />
      </div>
      <UserMenu />
    </div>
  )
}
