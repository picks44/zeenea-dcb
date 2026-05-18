import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface InlineCopyButtonProps {
  value: string
  ariaLabel?: string
  className?: string
  /** h-5 ghost micro-action for documentation density */
  dense?: boolean
}

/** Compact inline copy control (GitHub SHA / API key style). */
export function InlineCopyButton({ value, ariaLabel = 'Copy', className, dense }: InlineCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Tooltip content={copied ? 'Copied' : 'Copy'} side="top" delayDuration={300}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex flex-shrink-0 items-center justify-center rounded transition-colors',
          dense
            ? 'h-5 w-5 text-[#b8b8c8] hover:text-[#33333d] opacity-70 hover:opacity-100'
            : 'h-6 w-6 text-[#9898a7] hover:text-[#33333d] hover:bg-[#f5f5fa]',
          className,
        )}
      >
        {copied ? (
          <Check className={cn(dense ? 'h-3 w-3' : 'h-3.5 w-3.5', 'text-[#047800]')} />
        ) : (
          <Copy className={dense ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        )}
      </button>
    </Tooltip>
  )
}
