import { useCallback, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_QUERIES } from '@/lib/layoutBreakpoints'

const STORAGE_KEY = 'dcb-nav-collapsed'

function readStoredOverride(): boolean | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'true') return true
    if (v === 'false') return false
  } catch {
    /* ignore */
  }
  return null
}

/** User-controlled compact main sidebar (Contracts / Components); defaults to icon-only below xl. */
export function useNavCollapsed() {
  const isXl = useMediaQuery(MEDIA_QUERIES.panelPinned)
  const [override, setOverride] = useState<boolean | null>(readStoredOverride)

  const collapsed = override ?? !isXl

  const toggle = useCallback(() => {
    setOverride(prev => {
      const current = prev ?? !isXl
      const next = !current
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [isXl])

  return { collapsed, toggle }
}
