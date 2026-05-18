import { useState, useRef, useCallback } from 'react'
import { Check } from 'lucide-react'

interface ToastOptions {
  message: string
  durationMs?: number
}

export function useToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(({ message, durationMs = 2500 }: ToastOptions) => {
    setMessage(message)
    setVisible(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), durationMs)
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return { visible, message, show, hide }
}

interface ToastProps {
  visible: boolean
  message: string
}

export function Toast({ visible, message }: ToastProps) {
  if (!visible) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-neutral-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 fade-in-0 duration-150">
      <Check className="h-3.5 w-3.5 text-green-400" />
      {message}
    </div>
  )
}
