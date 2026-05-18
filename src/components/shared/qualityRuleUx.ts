import { cn } from '@/lib/utils'

/** Shared styling for quality rule editing surfaces in metadata modals. */
export const qualityRuleListShellClass =
  'border border-[#e4e4f0] rounded-lg divide-y divide-[#e4e4f0] bg-white overflow-hidden'

export const qualityRuleRowClass = 'relative px-3 py-2.5'

export const qualityRuleRowCompactClass = 'relative px-2.5 py-2'

export const qualityRuleFieldLabelClass = 'text-[10px] font-medium text-[#656574] mb-0.5 block'

export const qualityRuleTextareaClass = (compact?: boolean) =>
  cn('text-xs resize-y w-full', compact ? 'min-h-[64px]' : 'min-h-[76px]')

export const qualityRuleNameInputClass = 'h-7 text-xs'

export const qualityRuleRemoveButtonClass = cn(
  'absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded',
  'text-[#9898a7] hover:text-[#c12c11] hover:bg-[#fff2ee] transition-colors',
)
