/**
 * Layout breakpoints for Data Contract Builder.
 * Aligns with Tailwind defaults: lg 1024px, xl 1280px, 2xl 1536px.
 *
 * Cramped zone observed ~1200–1440px with four columns pinned (224+192+main+280).
 * Below xl we compact sidebars and float the readiness/quality panel.
 */
export const LAYOUT_BREAKPOINTS = {
  /** Full section labels + pinned readiness panel */
  xl: 1280,
  /** Compact icon sidebars; readiness panel as overlay */
  lg: 1024,
} as const

export const READINESS_PANEL_WIDTH_PX = 280

export const MEDIA_QUERIES = {
  panelPinned: `(min-width: ${LAYOUT_BREAKPOINTS.xl}px)`,
  layoutCompact: `(min-width: ${LAYOUT_BREAKPOINTS.lg}px) and (max-width: ${LAYOUT_BREAKPOINTS.xl - 1}px)`,
} as const
