import { useState, useMemo } from 'react'
import { Check, Copy, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { CollaboratorRole, DataContract } from '@/types/odcs'
import { generateODCSYaml } from '@/lib/odcsYamlGenerator'
import { computePublicationReadiness } from '@/lib/publicationReadiness'
import { cn } from '@/lib/utils'
import {
  DOCUMENTED_FIELDS_TOOLTIP,
  EXPORT_COVERAGE,
  READINESS_SCORE_TOOLTIP,
} from '@/lib/uxCopy'
import { Tooltip } from '@/components/ui/tooltip'

interface ReadinessPanelProps {
  contract: DataContract
  myRole: CollaboratorRole
  hasEditedSincePublish: boolean
}

function CheckRow({
  label,
  ok,
  variant,
  badge,
}: {
  label: string
  ok: boolean
  variant: 'required' | 'recommended'
  badge?: string
}) {
  const isRequired = variant === 'required'

  return (
    <li className="flex items-center gap-2.5">
      <div
        className={cn(
          'h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0',
          ok && isRequired && 'bg-[#d3efcd]',
          ok && !isRequired && 'bg-[#e8f5e6]',
          !ok && isRequired && 'bg-[#f5f5fa]',
          !ok && !isRequired && 'border border-[#d3d3e5] bg-white',
        )}
      >
        {ok ? (
          <Check className={cn('h-2.5 w-2.5', isRequired ? 'text-[#047800]' : 'text-[#3a8f38]')} />
        ) : isRequired ? (
          <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" />
        ) : null}
      </div>
      <span
        className={cn(
          'text-xs leading-snug flex-1 min-w-0',
          ok ? 'text-[#33333d]' : 'text-[#656574]',
        )}
      >
        {label}
      </span>
      {badge ? (
        <span className="text-[10px] font-medium text-[#656574] tabular-nums flex-shrink-0">
          {badge}
        </span>
      ) : null}
    </li>
  )
}

export function ReadinessPanel({ contract, myRole, hasEditedSincePublish }: ReadinessPanelProps) {
  const [yamlOpen, setYamlOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const readiness = useMemo(
    () => computePublicationReadiness(contract, myRole, hasEditedSincePublish),
    [contract, myRole, hasEditedSincePublish],
  )

  const {
    requiredChecks,
    recommendedChecks,
    publishStatus,
    fieldCount,
    fieldsWithDesc,
    descCoverage,
    piiCount,
    healthScore,
    nextSteps,
    validationErrors,
    validationWarnings,
  } = readiness

  const yaml = useMemo(() => generateODCSYaml(contract), [contract])

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const scoreColor =
    healthScore >= 90 ? 'text-[#047800] bg-[#f0ffec] border-emerald-200' :
    healthScore >= 60 ? 'text-[#0550dc] bg-[#edf6ff] border-[#b8d0fb]' :
    'text-[#33333d] bg-[#f5f5fa] border-[#d3d3e5]'

  const barColor =
    healthScore >= 90 ? 'bg-[#3dab3b]' :
    healthScore >= 60 ? 'bg-[#0550dc]' :
    'bg-[#9898a7]'

  return (
    <div className="w-[280px] flex-shrink-0 border-l border-[#d3d3e5] bg-white flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#d3d3e5] flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-[#33333d]">Publication readiness</span>
          <Tooltip content={READINESS_SCORE_TOOLTIP} side="left" delayDuration={400}>
            <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-default', scoreColor)}>
              {healthScore}/100
            </span>
          </Tooltip>
        </div>

        <div className="h-1.5 rounded-full bg-[#f5f5fa] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {publishStatus.ready ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-[#047800] flex-shrink-0" />
              <span className="text-[11px] text-[#047800] font-medium leading-snug">{publishStatus.message}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-[#d27b00] flex-shrink-0" />
              <span className="text-[11px] text-[#d27b00] line-clamp-2" title={publishStatus.message}>
                {publishStatus.message}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">

        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">
            Required to publish
          </p>
          <ul className="space-y-1.5">
            {requiredChecks.map(item => (
              <CheckRow key={item.key} label={item.label} ok={item.ok} variant="required" />
            ))}
          </ul>
        </div>

        {fieldCount > 0 && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2.5">
              Field quality
            </p>

            <div className="mb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#3f3f4a]">Documented fields</span>
                <span className={cn(
                  'text-[11px] font-semibold',
                  descCoverage === 1 ? 'text-[#047800]' : descCoverage >= 0.5 ? 'text-[#d27b00]' : 'text-[#656574]',
                )}>
                  {fieldsWithDesc}/{fieldCount}
                </span>
              </div>
              <Tooltip content={DOCUMENTED_FIELDS_TOOLTIP} side="top" delayDuration={400}>
                <div className="h-1.5 rounded-full bg-[#f5f5fa] overflow-hidden cursor-default">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      descCoverage === 1 ? 'bg-[#3dab3b]' : 'bg-[#7aacf8]',
                    )}
                    style={{ width: `${Math.round(descCoverage * 100)}%` }}
                  />
                </div>
              </Tooltip>
              {fieldsWithDesc < fieldCount && (
                <p className="text-[11px] text-[#656574] mt-1">
                  {fieldCount - fieldsWithDesc} field{fieldCount - fieldsWithDesc > 1 ? 's are' : ' is'} missing documentation
                </p>
              )}
            </div>

            {piiCount > 0 && (
              <div className="mt-2.5 flex items-center gap-2 bg-[#fff2ee] rounded-lg px-2.5 py-2 border border-rose-100">
                <AlertTriangle className="h-3 w-3 text-[#c12c11] flex-shrink-0" />
                <span className="text-[11px] text-[#c12c11] leading-snug">
                  <strong>{piiCount}</strong> personal data field{piiCount > 1 ? 's' : ''} (PII) — ensure data privacy
                </span>
              </div>
            )}
          </div>
        )}

        {validationErrors.length >= 1 && (
          <div className="px-4 py-3 border-t border-[#e4e4f0]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">Blocking issues</p>
            <ul className="space-y-1">
              {validationErrors.slice(0, 6).map((e, i) => (
                <li key={`${e.code}-${i}`} className="text-[11px] text-[#c12c11] leading-snug">{e.message}</li>
              ))}
            </ul>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="px-4 py-3 border-t border-[#e4e4f0]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">Warnings</p>
            <ul className="space-y-1">
              {validationWarnings.slice(0, 6).map((w, i) => (
                <li key={`${w.code}-${i}`} className="text-[11px] text-[#d27b00] leading-snug flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{w.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">
            Recommended
          </p>
          <ul className="space-y-1.5">
            {recommendedChecks.map(item => (
              <CheckRow
                key={item.key}
                label={item.label}
                ok={item.ok}
                variant="recommended"
                badge={item.badge}
              />
            ))}
          </ul>
        </div>

        {nextSteps.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">
              Next steps
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 text-[#3d7cf4] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-[#33333d] leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-[#d3d3e5] flex-shrink-0">
        <button
          onClick={() => setYamlOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#3f3f4a] hover:bg-[#fbfbff] transition-colors"
        >
          <span className="text-left">
            <span className="block font-medium">Export YAML</span>
            <span className="block text-[10px] text-[#656574] font-normal leading-snug mt-0.5">
              Preview ODCS YAML payload
            </span>
          </span>
          {yamlOpen ? <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />}
        </button>

        {yamlOpen && (
          <div className="border-t border-[#e4e4f0]">
            <div className="px-4 py-2 flex items-center justify-between bg-[#fbfbff]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#656574]">ODCS v3.1.0</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[#3f3f4a] hover:text-[#33333d] transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-[#047800]" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="px-4 py-2 border-b border-[#e4e4f0] bg-white space-y-1">
              <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.includedInYaml}</p>
              <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.workflowOnly}</p>
            </div>
            <pre className="text-[10px] font-mono text-[#33333d] px-4 py-3 max-h-56 overflow-y-auto bg-[#fbfbff] leading-4">
              {yaml}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
