/** Lighter shells and spacing for published documentation-view layouts. */
export const docShellClass =
  'border border-[#e4e4f0] rounded-lg overflow-hidden bg-white'

export const docGovernanceShellClass =
  'border border-[#e4e4f0] rounded-lg overflow-hidden bg-white'

export const docSectionHeaderMarginClass = 'mb-4'

export const docGovernanceHeadClass =
  'text-[11px] font-medium text-[#656574]'

export const docGovernanceHeadRowClass =
  'border-b border-[#ebebf0] px-3 py-1.5'

export const docGovernanceRowClass = 'px-3 py-1'

/** Published + laptop (viewport &lt; xl, panel overlay). */
export const DOC_COMPACT_SPACING = {
  sectionStack: 'space-y-2.5',
  sectionHeader: 'mb-3',
  fieldStack: 'gap-y-2',
  gridGap: 'gap-x-3 gap-y-2',
} as const

export const DOC_COMPACT_TEXT = {
  label: 'text-[11px] font-medium text-[#33333d] mb-0.5',
  value: 'text-[12px] leading-snug text-[#33333d]',
  meta: 'text-[11px] leading-snug text-[#656574]',
  muted: 'text-[10px] leading-snug text-[#9898a7]',
} as const

export const DOC_COMPACT_ROW = 'px-3 py-2'
