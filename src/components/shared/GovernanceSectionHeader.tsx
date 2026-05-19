import { cn } from '@/lib/utils'

export {
  ContractSectionHeader,
  ContractSectionHeader as GovernanceSectionHeader,
  contractSectionHeaderMarginClass,
  type ContractSectionHeaderProps,
  type ContractSectionHeaderProps as GovernanceSectionHeaderProps,
} from '@/components/shared/ContractSectionHeader'

export const governanceTableShellClass =
  'border border-neutral-200 rounded-xl overflow-hidden bg-white'

export const governanceTableHeadClass =
  'text-[10px] font-semibold uppercase tracking-wide text-neutral-400'

export const governanceTableHeadRowClass =
  'border-b border-neutral-100 bg-neutral-25/80 px-3 py-2'

export const governanceTableRowClass = 'px-3 py-1.5'

export const governanceTableFooterClass =
  'px-3 py-2.5 border-t border-neutral-100 bg-neutral-25/50'

/** Secondary table footer action — shared across Data access, SLA, etc. */
export const governanceTableFooterActionClass = cn(
  'inline-flex items-center gap-1.5 rounded-md -mx-0.5 px-1 py-0.5',
  'text-xs font-medium text-neutral-500',
  'hover:text-blue-700 hover:bg-blue-25',
  'active:text-blue-800 transition-colors',
)
