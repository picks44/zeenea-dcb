import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GitBranch, ArrowRight, Zap, AlertTriangle } from 'lucide-react'
import { bumpMinorVersion, bumpMajorVersion } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VersionBumpModalProps {
  open: boolean
  currentVersion: string
  onClose: () => void
  onConfirm: (newVersion: string) => void
}

type BumpType = 'minor' | 'major'

export function VersionBumpModal({ open, currentVersion, onClose, onConfirm }: VersionBumpModalProps) {
  const [selected, setSelected] = useState<BumpType>('minor')

  const minorVersion = bumpMinorVersion(currentVersion)
  const majorVersion = bumpMajorVersion(currentVersion)

  const newVersion = selected === 'minor' ? minorVersion : majorVersion

  const options: { type: BumpType; label: string; description: string; changes: string[]; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    {
      type: 'minor',
      label: 'Minor change',
      description: 'Non-breaking updates that add or clarify without removing anything.',
      changes: [
        'Adding new optional fields',
        'Improving descriptions',
        'Adding governance contacts',
        'Clarifying labels',
      ],
      icon: Zap,
      color: 'emerald',
    },
    {
      type: 'major',
      label: 'Major change',
      description: 'Breaking changes that may affect teams using this data.',
      changes: [
        'Removing or renaming fields',
        'Changing field types',
        'Restructuring the schema',
        'Changing the business contract owner',
      ],
      icon: AlertTriangle,
      color: 'amber',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-[#d0e8fd] flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-[#0550dc]" />
            </div>
            <DialogTitle>Create New Version</DialogTitle>
          </div>
          <DialogDescription>
            A new <strong className="text-[#33333d]">Draft</strong> will be created with a bumped version number.
            The current published version stays live.
          </DialogDescription>
        </DialogHeader>

        {/* Version preview */}
        <div className="flex items-center justify-center gap-3 py-3 bg-[#fbfbff] rounded-lg border border-[#d3d3e5]">
          <span className="font-mono text-sm font-semibold text-[#3f3f4a] bg-white px-3 py-1.5 rounded border border-[#d3d3e5]">
            v{currentVersion}
          </span>
          <ArrowRight className="h-4 w-4 text-[#656574]" />
          <span className="font-mono text-sm font-bold text-[#12131f] bg-white px-3 py-1.5 rounded border-2 border-[#93b8f8]">
            v{newVersion}
          </span>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map(opt => {
            const Icon = opt.icon
            const isSelected = selected === opt.type
            return (
              <button
                key={opt.type}
                onClick={() => setSelected(opt.type)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border-2 transition-all',
                  isSelected
                    ? opt.color === 'emerald'
                      ? 'border-[#3dab3b] bg-[#f0ffec]'
                      : 'border-[#d27b00] bg-[#fff8ec]'
                    : 'border-[#d3d3e5] hover:border-[#d3d3e5] bg-white'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    opt.color === 'emerald' ? 'bg-[#d3efcd]' : 'bg-[#ffebce]'
                  )}>
                    <Icon className={cn(
                      'h-4 w-4',
                      opt.color === 'emerald' ? 'text-[#047800]' : 'text-[#d27b00]'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#12131f] text-sm">{opt.label}</span>
                      <span className={cn(
                        'text-xs font-mono px-1.5 py-0.5 rounded',
                        opt.color === 'emerald' ? 'bg-[#d3efcd] text-[#047800]' : 'bg-[#ffebce] text-[#d27b00]'
                      )}>
                        v{opt.type === 'minor' ? minorVersion : majorVersion}
                      </span>
                    </div>
                    <p className="text-xs text-[#3f3f4a] mb-2">{opt.description}</p>
                    <ul className="space-y-0.5">
                      {opt.changes.map(c => (
                        <li key={c} className="text-xs text-[#656574] flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-[#d3d3e5] flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(newVersion)} className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Create Draft v{newVersion}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
