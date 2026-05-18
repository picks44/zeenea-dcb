import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={cn('flex items-center gap-1.5 text-xs', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3 w-3 text-neutral-300 flex-shrink-0" />}
            {isLast || !item.onClick ? (
              <span className={cn(
                'font-medium',
                isLast ? 'text-neutral-900' : 'text-neutral-400'
              )}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export { Breadcrumb }
