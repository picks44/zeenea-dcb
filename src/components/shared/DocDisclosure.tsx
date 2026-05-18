import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocDisclosureProps {
  title: ReactNode
  subtitle?: ReactNode
  open: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
  headerClassName?: string
}

/** Lightweight chevron disclosure for documentation-style panels. */
export function DocDisclosure({
  title,
  subtitle,
  open,
  onToggle,
  children,
  className,
  headerClassName,
}: DocDisclosureProps) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between gap-2 text-left transition-colors',
          headerClassName,
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#9898a7]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9898a7]" />
          )}
          <span className="min-w-0">{title}</span>
        </span>
        {subtitle ? <span className="flex-shrink-0">{subtitle}</span> : null}
      </button>
      {open ? children : null}
    </div>
  )
}
