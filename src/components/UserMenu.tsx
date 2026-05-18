import { useState, useRef, useEffect } from 'react'
import { Settings, LogOut, User } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface UserMenuProps {
  name?: string
  email?: string
}

export function UserMenu({ name = 'Florent L.', email = 'florent@lonestone.io' }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)}>
        <Avatar name={name} size="md" className="hover:opacity-90 transition-opacity" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-52 bg-white border border-[#d3d3e5] rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-3 border-b border-[#e4e4f0]">
            <p className="text-xs font-semibold text-[#12131f] truncate">{name}</p>
            <p className="text-[11px] text-[#656574] truncate">{email}</p>
          </div>
          <div className="py-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#33333d] hover:bg-[#fbfbff] transition-colors">
              <Settings className="h-3.5 w-3.5 text-[#656574]" />
              Settings
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#33333d] hover:bg-[#fbfbff] transition-colors">
              <User className="h-3.5 w-3.5 text-[#656574]" />
              Profile
            </button>
          </div>
          <div className="border-t border-[#e4e4f0] py-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#3f3f4a] hover:bg-[#fbfbff] transition-colors">
              <LogOut className="h-3.5 w-3.5 text-[#656574]" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
