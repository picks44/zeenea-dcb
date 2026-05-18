import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmConfig {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmDialogProps {
  config: ConfirmConfig | null
  onClose: () => void
}

export function ConfirmDialog({ config, onClose }: ConfirmDialogProps) {
  if (!config) return null

  const handleConfirm = () => {
    config.onConfirm()
    onClose()
  }

  const handleCancel = () => {
    config.onCancel?.()
    onClose()
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) handleCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {config.cancelLabel ?? 'Cancel'}
          </Button>
          <Button variant={config.variant ?? 'destructive'} onClick={handleConfirm}>
            {config.confirmLabel ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
