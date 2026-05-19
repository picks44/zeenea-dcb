/** Lighter shells and spacing for published documentation-view layouts. */
export const docShellClass =
  'border border-neutral-100 rounded-lg overflow-hidden bg-white'

export const docGovernanceShellClass =
  'border border-neutral-100 rounded-lg overflow-hidden bg-white'

export const docSectionHeaderMarginClass = 'mb-4'

export const docGovernanceHeadClass =
  'text-[11px] font-medium text-neutral-400'

export const docGovernanceHeadRowClass =
  'border-b border-neutral-100 px-3 py-1.5'

export const docGovernanceRowClass = 'px-3 py-1'

/** Published + laptop (viewport &lt; xl, panel overlay). Softer than initial compact pass. */
export const DOC_COMPACT_SPACING = {
  sectionStack: 'space-y-3',
  sectionHeader: 'mb-3.5',
  fieldStack: 'gap-y-2.5',
  gridGap: 'gap-x-3 gap-y-2.5',
} as const

export const DOC_COMPACT_TEXT = {
  label: 'text-[11px] font-medium text-neutral-600 mb-0.5',
  value: 'text-[12px] leading-relaxed text-neutral-600',
  meta: 'text-[11px] leading-relaxed text-neutral-400',
  muted: 'text-[10px] leading-relaxed text-neutral-400',
} as const

export const DOC_COMPACT_ROW = 'px-3 py-2.5'
