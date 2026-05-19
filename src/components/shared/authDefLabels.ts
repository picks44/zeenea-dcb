import {
  FUNDAMENTALS_AUTH_DEF_LABELS,
  FUNDAMENTALS_AUTH_DEF_TYPES,
  SHARED_AUTH_DEF_TYPES,
  ZEENEA_AUTH_DEF_TYPE,
} from '@/types/odcsShared'

export function authDefTypeLabel(type: string): string {
  if (type === ZEENEA_AUTH_DEF_TYPE) return 'Actian (Zeenea)'
  if ((FUNDAMENTALS_AUTH_DEF_TYPES as readonly string[]).includes(type)) {
    return FUNDAMENTALS_AUTH_DEF_LABELS[type as keyof typeof FUNDAMENTALS_AUTH_DEF_LABELS]
  }
  if ((SHARED_AUTH_DEF_TYPES as readonly string[]).includes(type)) {
    return type
  }
  return type
}
