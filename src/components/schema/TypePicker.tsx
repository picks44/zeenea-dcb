import { useRef, useEffect } from 'react'
import { LogicalType } from '@/types/odcs'
import { LOGICAL_TYPES } from './constants'
import { cn } from '@/lib/utils'

interface TypePickerProps {
  onSelect: (type: LogicalType) => void
  onClose: () => void
}

export function TypePicker({ onSelect, onClose }: TypePickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const types = LOGICAL_TYPES.filter(t => t.value !== 'unknown')

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 w-[340px]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">
        What type of data?
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {types.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.value}
              onClick={() => onSelect(t.value)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-transparent hover:border-neutral-200 hover:bg-neutral-25 transition-all text-center"
            >
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', t.iconBg)}>
                <Icon className={cn('h-4 w-4', t.iconColor)} />
              </div>
              <span className="text-[10px] font-medium text-neutral-600 leading-tight">
                {t.pmLabel}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
