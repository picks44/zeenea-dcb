import { cn } from '@/lib/utils'

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_PALETTE = [
  'bg-[#ecffff]', 'bg-[#d0efed]', 'bg-[#dde6ec]',
  'bg-[#eed7ff]', 'bg-[#ffd5dd]', 'bg-[#d3efcd]',
  'bg-[#ffdacf]', 'bg-[#ffebce]',
]

export function avatarBg(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-9 w-9 text-[13px]',
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-[#12131f] ring-1 ring-white',
        SIZE_CLASSES[size],
        avatarBg(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
