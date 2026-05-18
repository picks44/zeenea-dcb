import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface InlineCopyButtonProps {
  value: string
  ariaLabel?: string
  className?: string
}

/** Compact inline copy control (GitHub SHA / API key style). */
export function InlineCopyButton({ value, ariaLabel = 'Copy', className }: InlineCopyButtonProps) {
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
          'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
          'text-[#9898a7] hover:text-[#33333d] hover:bg-[#f5f5fa] transition-colors',
          className,
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#047800]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </Tooltip>
  )
}
