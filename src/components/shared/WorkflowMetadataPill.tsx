import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  WORKFLOW_PILL_APPLICATION_LIFECYCLE,
  WORKFLOW_PILL_NOT_IN_ODCS,
  WORKFLOW_PILL_NOT_PUBLISHED,
  WORKFLOW_PILL_WORKFLOW_ONLY,
} from '@/lib/uxCopy'

/** Lightweight classification for application-only / non-exported governance metadata. */
export type WorkflowMetadataPillVariant =
  | 'workflow-only'
  | 'not-in-odcs'
  | 'application-lifecycle'
  | 'not-published'

const PILL_LABELS: Record<WorkflowMetadataPillVariant, string> = {
  'workflow-only': WORKFLOW_PILL_WORKFLOW_ONLY,
  'not-in-odcs': WORKFLOW_PILL_NOT_IN_ODCS,
  'application-lifecycle': WORKFLOW_PILL_APPLICATION_LIFECYCLE,
  'not-published': WORKFLOW_PILL_NOT_PUBLISHED,
}

export interface WorkflowMetadataPillProps {
  variant: WorkflowMetadataPillVariant
  /** Override default label (rare; prefer uxCopy constants). */
  label?: string
  className?: string
}

export function WorkflowMetadataPill({ variant, label, className }: WorkflowMetadataPillProps) {
  return (
    <span
      className={cn(
        'inline-flex align-middle items-center shrink-0',
        'rounded-sm border border-[#ebebf0] bg-[#fafafc]/80',
        'px-1 py-px text-[10px] font-normal leading-none text-[#9898a7]',
        'tracking-normal whitespace-nowrap',
        className,
      )}
    >
      {label ?? PILL_LABELS[variant]}
    </span>
  )
}

/** Business copy with an adjacent workflow-metadata pill — consistent section intros. */
export function WorkflowMetadataNote({
  children,
  pill,
  className,
}: {
  children: ReactNode
  pill: WorkflowMetadataPillVariant
  className?: string
}) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5', className)}>
      <span>{children}</span>
      <WorkflowMetadataPill variant={pill} />
    </span>
  )
}
