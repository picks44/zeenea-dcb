import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  WORKFLOW_PILL_APPLICATION_LIFECYCLE,
  WORKFLOW_PILL_NOT_IN_ODCS,
  WORKFLOW_PILL_NOT_PUBLISHED,
  WORKFLOW_PILL_TITLES,
  WORKFLOW_PILL_WORKFLOW_ONLY,
  type WorkflowMetadataPillVariant,
} from '@/lib/uxCopy'

export type { WorkflowMetadataPillVariant }

const PILL_LABELS: Record<WorkflowMetadataPillVariant, string> = {
  'workflow-only': WORKFLOW_PILL_WORKFLOW_ONLY,
  'not-in-odcs': WORKFLOW_PILL_NOT_IN_ODCS,
  'application-lifecycle': WORKFLOW_PILL_APPLICATION_LIFECYCLE,
  'not-published': WORKFLOW_PILL_NOT_PUBLISHED,
}

const PILL_STYLES: Record<WorkflowMetadataPillVariant, string> = {
  'not-in-odcs':
    'border-[#f0dcc8] bg-[#fff8f3] text-[#8a5c3a]',
  'workflow-only':
    'border-[#f0dcc8] bg-[#fff8f3] text-[#8a5c3a]',
  'application-lifecycle':
    'border-[#e4dff0] bg-[#faf9fc] text-[#6b6080]',
  'not-published':
    'border-[#f5d0c4] bg-[#fff6f2] text-[#9a5040]',
}

export interface WorkflowMetadataPillProps {
  variant: WorkflowMetadataPillVariant
  /** Override default label (rare; prefer uxCopy constants). */
  label?: string
  className?: string
}

export function WorkflowMetadataPill({ variant, label, className }: WorkflowMetadataPillProps) {
  const text = label ?? PILL_LABELS[variant]

  return (
    <span
      title={WORKFLOW_PILL_TITLES[variant]}
      className={cn(
        'inline-flex align-middle items-center gap-0.5 shrink-0',
        'rounded-sm border px-1 py-px',
        'text-[10px] font-medium leading-none tracking-normal whitespace-nowrap',
        PILL_STYLES[variant],
        className,
      )}
    >
      <Info className="h-2.5 w-2.5 shrink-0 opacity-80" strokeWidth={2.25} aria-hidden />
      <span>{text}</span>
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
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1', className)}>
      <span>{children}</span>
      <WorkflowMetadataPill variant={pill} />
    </span>
  )
}
