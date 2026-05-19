import { useMemo } from 'react'
import { Check, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, X } from 'lucide-react'
import { CollaboratorRole, DataContract } from '@/types/odcs'
import {
  computePublicationReadiness,
  getSupplementalValidationErrors,
} from '@/lib/publicationReadiness'
import { cn } from '@/lib/utils'
import {
  CONTRACT_QUALITY_PANEL_TITLE,
  DOCUMENTED_FIELDS_TOOLTIP,
  PUBLISHED_READ_ONLY_STATUS,
  PUBLISHED_REQUIRED_SECTION_TITLE,
  READINESS_FIELD_QUALITY_TITLE,
  READINESS_IMPROVE_SECTION_TITLE,
  READINESS_NEXT_STEPS_TITLE,
  READINESS_PANEL_TITLE,
  READINESS_RECOMMENDATIONS_SECTION_TITLE,
  READINESS_REQUIRED_SECTION_TITLE,
  READINESS_SCORE_TOOLTIP,
  READINESS_VALIDATION_DETAILS_TITLE,
  START_NEW_VERSION_QUALITY_NOTE,
} from '@/lib/uxCopy'
import { validationUserMessage } from '@/lib/validationUserMessages'
import { findFirstUndocumentedField } from '@/lib/readinessAnchors'
import type { ReadinessGuidanceItem } from '@/lib/readinessGuidance'
import {
  navigateToValidationIssue,
  useReadinessNavigation,
} from '@/components/readiness/ReadinessNavigationContext'
interface ReadinessPanelProps {
  contract: DataContract
  contracts: DataContract[]
  myRole: CollaboratorRole
  hasEditedSincePublish: boolean
  /** Pinned in layout (xl+) or floating overlay (lg and below). */
  layout?: 'pinned' | 'overlay'
  onClose?: () => void
  docCompact?: boolean
}

function SectionHeaderWithScore({
  title,
  earned,
  max,
  tone = 'default',
  showFraction = true,
}: {
  title: string
  earned: number
  max: number
  tone?: 'required' | 'recommended' | 'default'
  showFraction?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 mb-1.5">
      <span
        className={cn(
          'text-[10px] font-semibold uppercase tracking-wide',
          tone === 'required' && 'text-[#55556a]',
          tone === 'recommended' && 'text-[#9898a7] font-medium normal-case tracking-normal',
          tone === 'default' && 'text-[#656574] font-medium normal-case tracking-normal',
        )}
      >
        {title}
      </span>
      {showFraction ? (
        <span className="text-[10px] font-medium tabular-nums text-[#9898a7] flex-shrink-0 leading-none">
          {earned} / {max}
        </span>
      ) : null}
    </div>
  )
}

const CHECK_ROW_GRID =
  'grid grid-cols-[16px_minmax(0,1fr)_auto] gap-x-2 items-center min-h-[26px] py-1 px-1 -mx-1'

function CheckRow({
  item,
  onNavigate,
  accentIncompleteRequired = false,
}: {
  item: ReadinessGuidanceItem
  onNavigate?: (item: ReadinessGuidanceItem) => void
  /** When true, incomplete required rows get a light orange accent (required section only). */
  accentIncompleteRequired?: boolean
}) {
  const { label, ok, variant, badge } = item
  const isRequired = variant === 'required'
  const clickable = Boolean(onNavigate && !ok)
  const showRequiredAccent = accentIncompleteRequired && isRequired && !ok

  const rowInner = (
    <>
      <span
        className={cn(
          'h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0',
          ok && isRequired && 'bg-[#e8f5e6]',
          ok && !isRequired && 'bg-[#f0f4ff]',
          showRequiredAccent && 'border border-[#f5d9b8] bg-[#fff7ed]',
          !ok && !showRequiredAccent && 'border border-[#e4e4f0] bg-[#fbfbff]',
        )}
      >
        {ok ? (
          <Check className={cn('h-2.5 w-2.5', isRequired ? 'text-[#047800]' : 'text-[#3a8f38]')} />
        ) : showRequiredAccent ? (
          <span className="h-1.5 w-1.5 rounded-full bg-[#e8a86a]" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" />
        )}
      </span>
      <span
        className={cn(
          'min-w-0 text-xs leading-snug text-left',
          ok ? 'text-[#33333d]' : showRequiredAccent ? 'text-[#7a4e12]' : 'text-[#656574]',
        )}
      >
        {label}
      </span>
      {badge ? (
        <span className="text-[10px] font-medium text-[#9898a7] tabular-nums flex-shrink-0 leading-none">
          {badge}
        </span>
      ) : (
        <span aria-hidden className="w-0" />
      )}
    </>
  )

  if (clickable) {
    return (
      <li>
        <button
          type="button"
          onClick={() => onNavigate!(item)}
          className={cn(
            'w-full rounded-md text-left transition-colors',
            CHECK_ROW_GRID,
            'hover:bg-[#f5f5fa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0550dc] cursor-pointer',
            showRequiredAccent && 'hover:bg-[#fff7ed]/70',
          )}
        >
          {rowInner}
        </button>
      </li>
    )
  }

  return (
    <li
      className={cn(
        CHECK_ROW_GRID,
        showRequiredAccent && 'rounded-md bg-[#fff7ed]/35',
      )}
    >
      {rowInner}
    </li>
  )
}

export function ReadinessPanel({
  contract,
  contracts,
  myRole,
  hasEditedSincePublish,
  layout = 'pinned',
  onClose,
  docCompact,
}: ReadinessPanelProps) {
  const readiness = useMemo(
    () => computePublicationReadiness(contract, myRole, hasEditedSincePublish, contracts),
    [contract, contracts, myRole, hasEditedSincePublish],
  )

  const nav = useReadinessNavigation()
  const publishAttempted = nav?.publishAttempted ?? false
  const firstUndocumented = useMemo(() => findFirstUndocumentedField(contract), [contract])

  const handleNavigateItem = (item: ReadinessGuidanceItem) => {
    if (!nav?.enabled || item.ok) return
    nav.navigateTo({ section: item.section, fieldId: item.fieldId })
  }

  const handleDocumentFieldsClick = () => {
    if (!nav?.enabled || !firstUndocumented) return
    nav.navigateTo({ section: 'schema', fieldId: firstUndocumented.fieldId })
  }

  const {
    requiredChecks,
    recommendedChecks,
    publishStatus,
    fieldCount,
    fieldsWithDesc,
    descCoverage,
    piiCount,
    healthScore,
    scoreContributions,
    nextSteps,
    validationErrors,
    validationWarnings,
  } = readiness

  const supplementalValidationErrors = useMemo(
    () => getSupplementalValidationErrors(validationErrors),
    [validationErrors],
  )

  const isPublishedView =
    contract.info.status === 'active' && !contract.inRevision

  const barColor =
    healthScore >= 90 ? 'bg-[#3dab3b]' :
    healthScore >= 60 ? 'bg-[#0550dc]' :
    'bg-[#9898a7]'

  const publishedDense = isPublishedView && docCompact
  const sectionPad = publishedDense ? 'px-2.5 py-1.5' : isPublishedView ? 'px-3 py-2' : 'px-3 py-2.5'
  const panelBorder = isPublishedView ? 'border-[#ebebf0]' : 'border-[#d3d3e5]'
  const listGap = 'space-y-0'

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white overflow-hidden',
        layout === 'pinned'
          ? cn('w-[280px] flex-shrink-0 border-l', panelBorder)
          : cn('fixed top-0 right-0 bottom-0 z-50 w-[min(100%,320px)] border-l shadow-xl', panelBorder),
      )}
    >

      <div className={cn(sectionPad, 'border-b flex-shrink-0', panelBorder)}>
        <div className={cn('flex items-center justify-between gap-2', publishedDense ? 'mb-1' : 'mb-1.5')}>
          <span className="text-xs font-semibold text-[#33333d] min-w-0 truncate">
            {isPublishedView ? CONTRACT_QUALITY_PANEL_TITLE : READINESS_PANEL_TITLE}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isPublishedView ? (
              <span
                className="text-[11px] font-semibold tabular-nums text-[#656574] cursor-default"
                title={READINESS_SCORE_TOOLTIP}
              >
                {healthScore}
                <span className="text-[#9898a7] font-medium"> / 100</span>
              </span>
            ) : null}
            {layout === 'overlay' && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="h-6 w-6 flex items-center justify-center rounded text-[#9898a7] hover:text-[#33333d] hover:bg-[#f5f5fa]"
                aria-label="Close panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className={cn('rounded-full bg-[#f5f5fa] overflow-hidden', publishedDense ? 'h-1' : 'h-1.5')}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <div className={cn('flex items-center gap-1.5', publishedDense ? 'mt-1.5' : 'mt-2')}>
          {isPublishedView ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-[#656574] flex-shrink-0" />
              <span className="text-[11px] text-[#656574] font-medium leading-snug">
                {PUBLISHED_READ_ONLY_STATUS}
              </span>
            </>
          ) : publishStatus.ready ? (
            <span className="text-[11px] text-[#047800] font-medium leading-snug">
              {publishStatus.message}
            </span>
          ) : (
            <>
              <AlertCircle
                className={cn(
                  'h-3 w-3 flex-shrink-0',
                  publishAttempted ? 'text-[#b8956a]' : 'text-[#9898a7]',
                )}
              />
              <span
                className={cn(
                  'text-[11px] line-clamp-2',
                  publishAttempted ? 'text-[#8a5c00] font-medium' : 'text-[#656574]',
                )}
                title={publishStatus.message}
              >
                {publishStatus.message}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto divide-y', isPublishedView ? 'divide-[#f0f0f5]' : 'divide-[#ebebf0]/90')}>

        <div className={sectionPad}>
          <SectionHeaderWithScore
            title={isPublishedView ? PUBLISHED_REQUIRED_SECTION_TITLE : READINESS_REQUIRED_SECTION_TITLE}
            earned={scoreContributions.required.earned}
            max={scoreContributions.required.max}
            tone="required"
          />
          <ul className={listGap}>
            {requiredChecks.map(item => (
              <CheckRow
                key={item.key}
                item={item}
                accentIncompleteRequired
                onNavigate={nav?.enabled ? handleNavigateItem : undefined}
              />
            ))}
          </ul>
        </div>

        <div className={sectionPad}>
          <SectionHeaderWithScore
            title={READINESS_FIELD_QUALITY_TITLE}
            earned={scoreContributions.documentation.earned}
            max={scoreContributions.documentation.max}
            tone="default"
          />

          {fieldCount > 0 ? (
            <>
              <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-[#3f3f4a]">Documented fields</span>
                <span className={cn(
                  'text-[10px] font-medium tabular-nums text-right leading-snug',
                  descCoverage === 1 ? 'text-[#047800]' : descCoverage >= 0.5 ? 'text-[#656574]' : 'text-[#9898a7]',
                )}>
                  {fieldsWithDesc} / {fieldCount} described
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-[#f5f5fa] overflow-hidden"
                title={DOCUMENTED_FIELDS_TOOLTIP}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    descCoverage === 1 ? 'bg-[#3dab3b]' : 'bg-[#7aacf8]',
                  )}
                  style={{ width: `${Math.round(descCoverage * 100)}%` }}
                />
              </div>
              {fieldsWithDesc < fieldCount && nav?.enabled && firstUndocumented ? (
                <button
                  type="button"
                  onClick={handleDocumentFieldsClick}
                  className="text-[10px] text-[#656574] mt-1 leading-snug hover:text-[#0550dc] hover:underline text-left"
                >
                  {fieldCount - fieldsWithDesc} without description — open field
                </button>
              ) : fieldsWithDesc < fieldCount ? (
                <p className="text-[10px] text-[#9898a7] mt-1 leading-snug">
                  {fieldCount - fieldsWithDesc} undocumented
                </p>
              ) : null}
            </div>

              {piiCount > 0 && (
                <p className="text-[11px] text-[#656574] mt-2 leading-snug">
                  <strong>{piiCount}</strong> personal data field{piiCount > 1 ? 's' : ''} flagged
                </p>
              )}
            </>
          ) : null}
        </div>

        {publishAttempted && supplementalValidationErrors.length > 0 && (
          <div className={sectionPad}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">
              {READINESS_VALIDATION_DETAILS_TITLE}
            </p>
            <ul className="space-y-1">
              {supplementalValidationErrors.slice(0, 6).map((e, i) => (
                <li key={`${e.code}-${i}`}>
                  {nav?.enabled ? (
                    <button
                      type="button"
                      onClick={() => navigateToValidationIssue(nav.navigateTo, e)}
                      className="w-full text-left text-[11px] text-[#8a5c00] leading-snug hover:underline cursor-pointer"
                    >
                      {validationUserMessage(e)}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#8a5c00] leading-snug">{validationUserMessage(e)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className={sectionPad}>
            <p className="text-[10px] font-medium text-[#9898a7] mb-1.5">
              {READINESS_RECOMMENDATIONS_SECTION_TITLE}
            </p>
            <ul className="space-y-1">
              {validationWarnings.slice(0, 6).map((w, i) => (
                <li key={`${w.code}-${i}`} className="text-[11px] text-[#656574] leading-snug flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{validationUserMessage(w)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={sectionPad}>
          <SectionHeaderWithScore
            title={READINESS_IMPROVE_SECTION_TITLE}
            earned={scoreContributions.recommended.earned}
            max={scoreContributions.recommended.max}
            tone="recommended"
          />
          <ul className={listGap}>
            {recommendedChecks.map(item => (
              <CheckRow
                key={item.key}
                item={item}
                onNavigate={nav?.enabled ? handleNavigateItem : undefined}
              />
            ))}
          </ul>
        </div>

        {isPublishedView ? (
          <div className={cn(sectionPad, 'border-t', panelBorder)}>
            <p className={cn(
              'leading-snug',
              publishedDense ? 'text-[10px] text-[#9898a7]' : 'text-[11px] text-[#656574]',
            )}>
              {START_NEW_VERSION_QUALITY_NOTE}
            </p>
          </div>
        ) : nextSteps.length > 0 ? (
          <div className={cn(sectionPad, 'bg-[#fbfbff]/60')}>
            <p className="text-[10px] font-medium text-[#9898a7] mb-1.5">
              {READINESS_NEXT_STEPS_TITLE}
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ArrowRight className="h-3 w-3 text-[#b8b8c8] flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-[#33333d] leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

    </div>
  )
}
