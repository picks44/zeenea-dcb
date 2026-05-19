import { cn } from '@/lib/utils'

export {
  ContractSectionHeader,
  ContractSectionHeader as GovernanceSectionHeader,
  contractSectionHeaderMarginClass,
  type ContractSectionHeaderProps,
  type ContractSectionHeaderProps as GovernanceSectionHeaderProps,
} from '@/components/shared/ContractSectionHeader'

export const governanceTableShellClass =
  'border border-[#d3d3e5] rounded-xl overflow-hidden bg-white'

export const governanceTableHeadClass =
  'text-[10px] font-semibold uppercase tracking-wide text-[#656574]'

export const governanceTableHeadRowClass =
  'border-b border-[#e4e4f0] bg-[#fbfbff]/80 px-3 py-2'

export const governanceTableRowClass = 'px-3 py-1.5'

export const governanceTableFooterClass =
  'px-3 py-2.5 border-t border-[#e4e4f0] bg-[#fbfbff]/50'

/** Secondary table footer action — shared across Data access, SLA, etc. */
export const governanceTableFooterActionClass = cn(
  'inline-flex items-center gap-1.5 rounded-md -mx-0.5 px-1 py-0.5',
  'text-xs font-medium text-[#3f3f4a]',
  'hover:text-[#0550dc] hover:bg-[#f0f4ff]',
  'active:text-[#0343be] transition-colors',
)
