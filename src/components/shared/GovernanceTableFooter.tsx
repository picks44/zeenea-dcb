import { Plus } from 'lucide-react'
import {
  governanceTableFooterActionClass,
  governanceTableFooterClass,
} from '@/components/shared/GovernanceSectionHeader'

interface GovernanceTableFooterProps {
  label: string
  onAdd: () => void
}

/** Shared add-row footer for governance table shells. */
export function GovernanceTableFooter({ label, onAdd }: GovernanceTableFooterProps) {
  return (
    <div className={governanceTableFooterClass}>
      <button type="button" onClick={onAdd} className={governanceTableFooterActionClass}>
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>
    </div>
  )
}
