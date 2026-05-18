import { useState, useMemo } from 'react'
import { Check, Copy, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { CollaboratorRole, DataContract } from '@/types/odcs'
import { generateODCSYaml } from '@/lib/odcsYamlGenerator'
import { validateContract, ValidationResult } from '@/lib/contractValidation'
import { cn } from '@/lib/utils'
import {
  DOCUMENTED_FIELDS_TOOLTIP,
  EXPORT_COVERAGE,
  HEALTH_GOVERNANCE_OWNER_CHECK,
  PUBLISH_REQUIRES_PUBLISHER,
  READINESS_SCORE_TOOLTIP,
} from '@/lib/uxCopy'
import { Tooltip } from '@/components/ui/tooltip'

interface ReadinessPanelProps {
  contract: DataContract
  myRole: CollaboratorRole
  hasEditedSincePublish: boolean
}

function publishReadinessMessage(
  validation: ValidationResult,
  myRole: CollaboratorRole,
  hasEditedSincePublish: boolean,
): { ready: boolean; message: string } {
  if (!validation.canPublish) {
    return {
      ready: false,
      message: validation.publishBlockReason ?? 'Complete required fields to publish.',
    }
  }
  if (myRole !== 'owner') {
    return { ready: false, message: PUBLISH_REQUIRES_PUBLISHER }
  }
  if (!hasEditedSincePublish) {
    return { ready: false, message: 'No unpublished changes since last publish.' }
  }
  return { ready: true, message: 'Ready for publication' }
}

function useHealth(contract: DataContract, myRole: CollaboratorRole, hasEditedSincePublish: boolean) {
  const { info, id, dataset, stakeholders } = contract
  const validation = validateContract(contract)
  const safeStakeholders = stakeholders ?? []
  const fieldCount = dataset.reduce((acc, t) => acc + t.columns.length, 0)
  const fieldsWithDesc = dataset.reduce(
    (acc, t) => acc + t.columns.filter(c => c.description.trim()).length, 0
  )
  const piiCount = dataset.reduce((acc, t) => acc + t.columns.filter(c => c.isPII).length, 0)

  const errorKeys = new Set(validation.errors.map(e => e.code))
  const schemaOk = !validation.errors.some(e => e.section === 'schema')
  const requiredChecks = [
    { key: 'title',   label: 'Contract name',           ok: !errorKeys.has('title') },
    { key: 'id',      label: 'Contract ID',              ok: !errorKeys.has('id') },
    { key: 'owner',   label: HEALTH_GOVERNANCE_OWNER_CHECK, ok: !errorKeys.has('owner') },
    { key: 'version', label: 'Version (e.g. 1.0.0)',    ok: !errorKeys.has('version') },
    { key: 'schema',  label: 'At least one field defined', ok: schemaOk },
  ]

  const stakeholderCount = safeStakeholders.length
  const recommendedChecks = [
    { key: 'domain',       label: 'Domain',                    ok: !!info.domain.trim() },
    { key: 'desc',         label: 'Business description',      ok: !!info.description.trim() },
    {
      key: 'stakeholders',
      label: 'Stakeholders assigned',
      ok: stakeholderCount > 0,
      badge: stakeholderCount > 0 ? String(stakeholderCount) : undefined,
    },
  ]

  const doneRequired = requiredChecks.filter(c => c.ok).length
  const publishStatus = publishReadinessMessage(validation, myRole, hasEditedSincePublish)
  const descCoverage = fieldCount > 0 ? fieldsWithDesc / fieldCount : 0

  // 0–100 health score: required (60) + quality (25) + stakeholders (15)
  const healthScore = Math.round(
    (doneRequired / requiredChecks.length) * 60 +
    descCoverage * 25 +
    (safeStakeholders.length > 0 ? 15 : 0)
  )

  // Next steps: max 2 — required metadata, then documentation, then collaboration
  const nextSteps: string[] = []
  if (!info.title.trim()) {
    nextSteps.push('Give your contract a name in Fundamentals')
  } else if (!id.trim()) {
    nextSteps.push('Set a contract ID in Fundamentals')
  } else if (!info.owner.trim()) {
    nextSteps.push('Assign a governance owner in Fundamentals')
  } else if (fieldCount === 0) {
    nextSteps.push('Add at least one field in Schema to describe your data')
  }
  if (nextSteps.length < 2 && fieldCount > 0 && fieldsWithDesc < fieldCount) {
    nextSteps.push('Document schema fields to improve discoverability and reuse')
  }
  if (nextSteps.length < 2) {
    if (piiCount > 0 && safeStakeholders.length === 0) {
      nextSteps.push(
        `${piiCount} PII field${piiCount > 1 ? 's' : ''} detected — add stakeholders including Data Privacy`,
      )
    } else if (safeStakeholders.length === 0 && fieldCount > 0) {
      nextSteps.push('Assign stakeholders for ownership and collaboration')
    }
  }

  return {
    requiredChecks, recommendedChecks,
    doneRequired, publishStatus,
    fieldCount, fieldsWithDesc, descCoverage, piiCount,
    healthScore, nextSteps: nextSteps.slice(0, 2),
    validationErrors: validation.errors,
    validationWarnings: validation.warnings,
  }
}

function CheckRow({
  label,
  ok,
  required,
  badge,
}: {
  label: string
  ok: boolean
  required: boolean
  badge?: string
}) {
  return (
    <li className="flex items-center gap-2.5">
      <div className={cn(
        'h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0',
        ok ? 'bg-[#d3efcd]' : required ? 'bg-[#f5f5fa]' : 'bg-[#fbfbff]'
      )}>
        {ok
          ? <Check className="h-2.5 w-2.5 text-[#047800]" />
          : required
            ? <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" />
            : <span className="h-1.5 w-1.5 rounded-full bg-[#d3d3e5]" />
        }
      </div>
      <span className={cn('text-xs leading-snug flex-1 min-w-0', ok ? 'text-[#33333d]' : 'text-[#656574]')}>
        {label}
      </span>
      {badge && (
        <span className="text-[10px] font-medium text-[#656574] tabular-nums flex-shrink-0">
          {badge}
        </span>
      )}
    </li>
  )
}

export function ReadinessPanel({ contract, myRole, hasEditedSincePublish }: ReadinessPanelProps) {
  const [yamlOpen, setYamlOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    requiredChecks, recommendedChecks,
    publishStatus,
    fieldCount, fieldsWithDesc, descCoverage, piiCount,
    healthScore, nextSteps, validationErrors, validationWarnings,
  } = useHealth(contract, myRole, hasEditedSincePublish)

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

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#f5f5fa] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        {/* Publish status */}
        <div className="mt-2 flex items-center gap-1.5">
          {publishStatus.ready ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-[#047800] flex-shrink-0" />
              <span className="text-[11px] text-[#047800] font-medium">{publishStatus.message}</span>
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

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">

        {/* Required */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2">
            Required to publish
          </p>
          <ul className="space-y-1.5">
            {requiredChecks.map(item => (
              <CheckRow key={item.key} label={item.label} ok={item.ok} required />
            ))}
          </ul>
        </div>

        {/* Schema quality */}
        {fieldCount > 0 && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#656574] mb-2.5">
              Field quality
            </p>

            {/* Description coverage */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#3f3f4a]">Documented fields</span>
                <span className={cn(
                  'text-[11px] font-semibold',
                  descCoverage === 1 ? 'text-[#047800]' : descCoverage >= 0.5 ? 'text-[#d27b00]' : 'text-[#656574]'
                )}>
                  {fieldsWithDesc}/{fieldCount}
                </span>
              </div>
              <Tooltip content={DOCUMENTED_FIELDS_TOOLTIP} side="top" delayDuration={400}>
                <div className="h-1.5 rounded-full bg-[#f5f5fa] overflow-hidden cursor-default">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      descCoverage === 1 ? 'bg-[#3dab3b]' : 'bg-[#7aacf8]'
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

            {/* PII warning */}
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

        {/* Recommended */}
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
                required={false}
                badge={item.badge}
              />
            ))}
          </ul>
        </div>

        {/* Next steps */}
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

      {/* Export YAML footer */}
      <div className="border-t border-[#d3d3e5] flex-shrink-0">
        <button
          onClick={() => setYamlOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#3f3f4a] hover:bg-[#fbfbff] transition-colors"
        >
          <span className="text-left">
            <span className="block font-medium">Export YAML</span>
            <span className="block text-[10px] text-[#656574] font-normal leading-snug mt-0.5">
              Preview exported ODCS payload
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
              <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.exported}</p>
              <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.workflow}</p>
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
