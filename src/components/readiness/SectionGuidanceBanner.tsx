import { cn } from '@/lib/utils'

interface SectionGuidanceHintProps {
  message: string
  className?: string
}

/** Inline micro-hint - no card, border, or background. */
export function SectionGuidanceHint({ message, className }: SectionGuidanceHintProps) {
  return (
    <p className={cn('text-[11px] text-[#9898a7] leading-snug mb-3', className)} role="status">
      {message}
    </p>
  )
}

/** @deprecated Use SectionGuidanceHint - kept for import compatibility during migration. */
export const SectionGuidanceBanner = SectionGuidanceHint
