import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, AlertTriangle, ArchiveX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContractLifecycleMenuProps {
  showDeprecate: boolean
  showRetire: boolean
  onDeprecate: () => void
  onRetire: () => void
  triggerClassName?: string
}

export function ContractLifecycleMenu({
  showDeprecate,
  showRetire,
  onDeprecate,
  onRetire,
  triggerClassName,
}: ContractLifecycleMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!showDeprecate && !showRetire) return null

  const handleDeprecate = () => {
    setOpen(false)
    onDeprecate()
  }

  const handleRetire = () => {
    setOpen(false)
    onRetire()
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(o => !o)}
        aria-label="Contract actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className={triggerClassName}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 min-w-[11rem] bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="py-1">
            {showDeprecate && (
              <button
                type="button"
                role="menuitem"
                onClick={handleDeprecate}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-600',
                  'transition-colors hover:bg-red-25 hover:text-red-700',
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Deprecate
              </button>
            )}
            {showRetire && (
              <button
                type="button"
                role="menuitem"
                onClick={handleRetire}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-600',
                  'transition-colors hover:bg-red-25 hover:text-red-700',
                )}
              >
                <ArchiveX className="h-3.5 w-3.5 flex-shrink-0" />
                Retire contract
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
