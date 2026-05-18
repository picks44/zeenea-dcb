import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { DataContract, SectionId } from '@/types/odcs'
import {
  computeSectionGuidance,
  issueToFieldId,
  issueToSection,
  type ReadinessFieldId,
  type SectionGuidanceInfo,
} from '@/lib/readinessGuidance'
import { validateContract, type ValidationIssue } from '@/lib/contractValidation'

export type ReadinessNavigateTarget = {
  section: SectionId
  fieldId?: ReadinessFieldId
}

type ReadinessNavigationValue = {
  enabled: boolean
  /** True after the user clicks Publish (blocked or not). Unlocks level-3 field emphasis. */
  publishAttempted: boolean
  /** Field highlighted from readiness navigation (level 2). */
  focusedFieldId: string | null
  sectionGuidance: Partial<Record<SectionId, SectionGuidanceInfo>>
  navigateTo: (target: ReadinessNavigateTarget) => void
  markPublishAttempted: () => void
  registerField: (fieldId: string, el: HTMLElement | null) => void
  registerSectionRoot: (section: SectionId, el: HTMLElement | null) => void
}

const ReadinessNavigationContext = createContext<ReadinessNavigationValue | null>(null)

const FOCUS_DURATION_MS = 2500

function flashElement(el: HTMLElement) {
  el.classList.add('schema-nav-flash')
  const cleanup = () => el.classList.remove('schema-nav-flash')
  el.addEventListener('animationend', cleanup, { once: true })
  window.setTimeout(cleanup, 1500)
}

interface ReadinessNavigationProviderProps {
  children: ReactNode
  contract: DataContract
  enabled: boolean
  onSectionChange: (section: SectionId) => void
}

export function ReadinessNavigationProvider({
  children,
  contract,
  enabled,
  onSectionChange,
}: ReadinessNavigationProviderProps) {
  const fieldsRef = useRef<Map<string, HTMLElement>>(new Map())
  const sectionRootsRef = useRef<Map<SectionId, HTMLElement>>(new Map())
  const focusTimerRef = useRef<number | null>(null)

  const [publishAttempted, setPublishAttempted] = useState(false)
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null)

  useEffect(() => {
    setPublishAttempted(false)
    setFocusedFieldId(null)
    if (focusTimerRef.current) {
      window.clearTimeout(focusTimerRef.current)
      focusTimerRef.current = null
    }
  }, [contract.uid])

  const validation = useMemo(() => validateContract(contract), [contract])
  const sectionGuidance = useMemo(
    () => (enabled ? computeSectionGuidance(contract, validation) : {}),
    [contract, validation, enabled],
  )

  const markPublishAttempted = useCallback(() => {
    if (!enabled) return
    setPublishAttempted(true)
  }, [enabled])

  const registerField = useCallback((fieldId: string, el: HTMLElement | null) => {
    if (el) fieldsRef.current.set(fieldId, el)
    else fieldsRef.current.delete(fieldId)
  }, [])

  const registerSectionRoot = useCallback((section: SectionId, el: HTMLElement | null) => {
    if (el) sectionRootsRef.current.set(section, el)
    else sectionRootsRef.current.delete(section)
  }, [])

  const navigateTo = useCallback(
    (target: ReadinessNavigateTarget) => {
      if (!enabled) return
      onSectionChange(target.section)

      if (target.fieldId) {
        setFocusedFieldId(target.fieldId)
        if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current)
        focusTimerRef.current = window.setTimeout(() => {
          setFocusedFieldId(null)
          focusTimerRef.current = null
        }, FOCUS_DURATION_MS)
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const el = target.fieldId
            ? fieldsRef.current.get(target.fieldId)
            : sectionRootsRef.current.get(target.section)

          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            flashElement(el)
            return
          }

          const sectionRoot = sectionRootsRef.current.get(target.section)
          if (sectionRoot) {
            sectionRoot.scrollIntoView({ behavior: 'smooth', block: 'start' })
            flashElement(sectionRoot)
          }
        })
      })
    },
    [enabled, onSectionChange],
  )

  const value = useMemo(
    () => ({
      enabled,
      publishAttempted,
      focusedFieldId,
      sectionGuidance,
      navigateTo,
      markPublishAttempted,
      registerField,
      registerSectionRoot,
    }),
    [
      enabled,
      publishAttempted,
      focusedFieldId,
      sectionGuidance,
      navigateTo,
      markPublishAttempted,
      registerField,
      registerSectionRoot,
    ],
  )

  return (
    <ReadinessNavigationContext.Provider value={value}>
      {children}
    </ReadinessNavigationContext.Provider>
  )
}

export function useReadinessNavigation() {
  return useContext(ReadinessNavigationContext)
}

export function useReadinessField(fieldId: string, isMissing: boolean, required = true) {
  const ctx = useReadinessNavigation()
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      ctx?.registerField(fieldId, node)
    },
    [ctx, fieldId],
  )

  const showEmphasis = Boolean(
    ctx?.enabled
    && isMissing
    && (ctx.publishAttempted || ctx.focusedFieldId === fieldId),
  )

  const showRequiredBadge = Boolean(ctx?.enabled && required && isMissing)

  return {
    setRef,
    showRequiredBadge,
    showEmphasis,
    isFocused: ctx?.focusedFieldId === fieldId,
  }
}

export function useSectionGuidanceRoot(section: SectionId) {
  const ctx = useReadinessNavigation()
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      ctx?.registerSectionRoot(section, node)
    },
    [ctx, section],
  )
  const info = ctx?.sectionGuidance[section]
  return {
    setRef,
    info,
  }
}

export function navigateToValidationIssue(
  navigateTo: (target: ReadinessNavigateTarget) => void,
  issue: Pick<ValidationIssue, 'code' | 'section' | 'fieldId'>,
) {
  const fullIssue: ValidationIssue = {
    code: issue.code,
    message: '',
    severity: 'error',
    section: issue.section,
    fieldId: issue.fieldId,
  }
  const fieldId = issue.fieldId
    ? (issue.fieldId as ReadinessFieldId)
    : issueToFieldId(fullIssue)
  navigateTo({
    section: issueToSection(fullIssue),
    fieldId,
  })
}
