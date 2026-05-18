import { AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionGuidanceBannerProps {
  message: string
  variant: 'required' | 'recommended'
  className?: string
}

export function SectionGuidanceBanner({ message, variant, className }: SectionGuidanceBannerProps) {
  const isRequired = variant === 'required'

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 mb-4',
        isRequired
          ? 'border-[#fed7aa] bg-[#fff7ed] text-[#8a5c00]'
          : 'border-[#e4e4f0] bg-[#fbfbff] text-[#656574]',
        className,
      )}
      role="status"
    >
      {isRequired ? (
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      ) : (
        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-[#9898a7]" />
      )}
      <p className="text-[11px] leading-snug">{message}</p>
    </div>
  )
}
