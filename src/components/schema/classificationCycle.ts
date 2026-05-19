import type { ClassificationValue } from '@/lib/p1Constants'

/** UI cycle order: none → public → restricted → confidential → none */
export function cycleClassification(
  current?: ClassificationValue,
): ClassificationValue | undefined {
  if (!current) return 'public'
  if (current === 'public') return 'restricted'
  if (current === 'restricted') return 'confidential'
  return undefined
}

export function classificationShortLabel(value?: ClassificationValue): string {
  if (!value) return '—'
  if (value === 'public') return 'PUB'
  if (value === 'restricted') return 'RES'
  return 'CONF'
}

export function classificationTooltip(value?: ClassificationValue): string {
  return `Classification: ${value ?? 'none'}`
}

/** Active-state colors aligned with existing schema flag tokens. */
export function classificationActiveColor(value?: ClassificationValue): string {
  if (!value) return ''
  if (value === 'public') return 'bg-neutral-50 text-neutral-600 border-neutral-200'
  if (value === 'restricted') return 'bg-orange-50 text-orange-700 border-orange-100'
  return 'bg-orange-100 text-orange-700 border-orange-100'
}
