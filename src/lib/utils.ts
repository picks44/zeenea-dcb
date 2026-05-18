import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version)
}

export function bumpMinorVersion(version: string): string {
  const parts = version.split('.')
  if (parts.length !== 3) return '1.1.0'
  const major = parseInt(parts[0], 10)
  const minor = parseInt(parts[1], 10)
  return `${major}.${minor + 1}.0`
}

export function bumpMajorVersion(version: string): string {
  const parts = version.split('.')
  if (parts.length !== 3) return '2.0.0'
  const major = parseInt(parts[0], 10)
  return `${major + 1}.0.0`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
