import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { docShellClass } from '@/components/shared/docViewTokens'

interface GovernanceDocListProps {
  children: ReactNode
  className?: string
}

/** Bordered list shell for compact governance documentation rows. */
export function GovernanceDocList({ children, className }: GovernanceDocListProps) {
  return (
    <div className={cn(docShellClass, 'divide-y divide-[#e4e4f0]', className)}>
      {children}
    </div>
  )
}
