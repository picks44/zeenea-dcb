import { useEffect, useRef, useState } from 'react'
import { Copy, Check, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DataContract, LifecycleStatus } from '@/types/odcs'
import { TagsEditor } from '@/components/shared/TagsEditor'
import { AuthoritativeDefinitionsEditor } from '@/components/shared/AuthoritativeDefinitionsEditor'
import { slugify, cn } from '@/lib/utils'
import { filterAuthoritativeDefinitionsForSave } from '@/lib/odcsSharedMappers'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import { FundamentalsReadOnlyView } from '@/components/shared/FundamentalsReadOnlyView'
import {
  CONTRACT_OWNER_HELPER,
  FUNDAMENTALS_INTRO,
  LABEL_CONTRACT_OWNER,
  SECTION_CONCEPT_ACCOUNTABILITY,
  LABEL_REFERENCE_LINKS,
  NAV_FUNDAMENTALS,
  READINESS_FIELD_CONTRACT_ID,
  READINESS_FIELD_CONTRACT_DOMAIN,
  READINESS_FIELD_CONTRACT_OWNER,
  READINESS_FIELD_CONTRACT_PURPOSE,
  READINESS_FIELD_CONTRACT_TITLE,
  READINESS_FIELD_CONTRACT_VERSION,
  READINESS_FIELD_FUNDAMENTALS_REF_LINKS,
  READINESS_HELPER_CONTRACT_ID,
  READINESS_HELPER_CONTRACT_NAME,
  READINESS_HELPER_CONTRACT_OWNER,
  READINESS_HELPER_CONTRACT_VERSION,
} from '@/lib/uxCopy'
import { GuidanceField } from '@/components/readiness/GuidanceField'
import {
  useReadinessField,
  useReadinessNavigation,
  useSectionGuidanceRoot,
} from '@/components/readiness/ReadinessNavigationContext'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

interface FundamentalsSectionProps {
  contract: DataContract
  onChange: (updates: Partial<DataContract['info']> & { id?: string }) => void
  isLocked: boolean
  isOwner: boolean
  isPublishedView?: boolean
  docCompact?: boolean
}

const STATUS_LABELS: Record<LifecycleStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  deprecated: 'Deprecated',
}

export function FundamentalsSection({
  contract,
  onChange,
  isLocked,
  isOwner,
  isPublishedView,
  docCompact,
}: FundamentalsSectionProps) {
  const { info, id } = contract
  const [idManuallyEdited, setIdManuallyEdited] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [additionalOpen, setAdditionalOpen] = useState(true)
  const [usage, setUsage] = useState(info.descriptionUsage ?? '')
  const [limitations, setLimitations] = useState(info.descriptionLimitations ?? '')
  const [authDefs, setAuthDefs] = useState<AuthoritativeDefinition[]>(
    filterAuthoritativeDefinitionsForSave(info.descriptionAuthoritativeDefinitions ?? []),
  )

  useEffect(() => {
    if (!idManuallyEdited && info.title) {
      const slug = slugify(info.title)
      onChange({ id: slug })
    }
  }, [info.title, idManuallyEdited])

  useEffect(() => {
    setUsage(info.descriptionUsage ?? '')
    setLimitations(info.descriptionLimitations ?? '')
    setAuthDefs(filterAuthoritativeDefinitionsForSave(info.descriptionAuthoritativeDefinitions ?? []))
  }, [contract.uid, info.descriptionUsage, info.descriptionLimitations, info.descriptionAuthoritativeDefinitions])

  const handleIdChange = (value: string) => {
    setIdManuallyEdited(true)
    if (/\s/.test(value)) {
      setIdError('ID cannot contain spaces. Use hyphens instead.')
    } else if (value && !/^[a-z0-9\-_]+$/.test(value)) {
      setIdError('Use only lowercase letters, numbers, hyphens, or underscores.')
    } else {
      setIdError(null)
    }
    onChange({ id: value })
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (isLocked) return
    const timer = window.setTimeout(() => {
      onChangeRef.current({
        descriptionUsage: usage.trim() || undefined,
        descriptionLimitations: limitations.trim() || undefined,
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [usage, limitations, isLocked])

  const tags = info.tags ?? []
  const { setRef: sectionRootRef } = useSectionGuidanceRoot('fundamentals')
  const nav = useReadinessNavigation()
  const { setRef: refLinksRef } = useReadinessField(READINESS_FIELD_FUNDAMENTALS_REF_LINKS, !hasReferenceLinks(), false)
  const semver = /^\d+\.\d+\.\d+$/

  function hasReferenceLinks() {
    return authDefs.some(d => d.url.trim() || d.type.trim() || (d.description ?? '').trim())
  }

  useEffect(() => {
    if (nav?.focusedFieldId === READINESS_FIELD_FUNDAMENTALS_REF_LINKS) {
      setAdditionalOpen(true)
    }
  }, [nav?.focusedFieldId])

  const ownerFieldLocked = isLocked || !isOwner
  const labelClass = 'text-xs font-medium text-[#33333d] mb-1 block'
  const inputClass = cn(isLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')
  const ownerInputClass = cn(ownerFieldLocked && 'bg-[#fbfbff] text-[#3f3f4a] cursor-not-allowed')

  return (
    <div
      ref={sectionRootRef}
      className={isLocked && isPublishedView ? 'max-w-3xl w-full' : 'max-w-[560px] w-full'}
    >
      <div className={docCompact && isLocked ? 'mb-3' : 'mb-6'}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9898a7] mb-1">
          {SECTION_CONCEPT_ACCOUNTABILITY}
        </p>
        <h2 className="text-base font-semibold text-[#12131f]">{NAV_FUNDAMENTALS}</h2>
        <p className="text-[#3f3f4a] text-xs mt-0.5 leading-relaxed">
          {FUNDAMENTALS_INTRO}
        </p>
      </div>

      {isLocked ? (
        <FundamentalsReadOnlyView contract={contract} compact={docCompact} />
      ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <GuidanceField
            fieldId={READINESS_FIELD_CONTRACT_TITLE}
            label="Contract name"
            required
            isMissing={!info.title.trim()}
            missingHelper={READINESS_HELPER_CONTRACT_NAME}
          >
            <Input
              value={info.title}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="e.g. Customer Orders"
              disabled={isLocked}
              className={inputClass}
            />
          </GuidanceField>
          <GuidanceField
            fieldId={READINESS_FIELD_CONTRACT_DOMAIN}
            label="Domain"
            required={false}
            isMissing={!info.domain.trim()}
          >
            <Input
              value={info.domain}
              onChange={e => onChange({ domain: e.target.value })}
              placeholder="e.g. Sales, Identity"
              disabled={isLocked}
              className={inputClass}
            />
          </GuidanceField>
        </div>

        <GuidanceField
          fieldId={READINESS_FIELD_CONTRACT_ID}
          label="ID"
          required
          isMissing={!id.trim()}
          missingHelper={READINESS_HELPER_CONTRACT_ID}
        >
          <div className="flex gap-2">
            <Input
              value={id}
              onChange={e => handleIdChange(e.target.value)}
              placeholder="customer-orders"
              disabled={ownerFieldLocked}
              className={cn(
                ownerInputClass,
                'font-mono text-sm flex-1',
                idError && 'border-[#c12c11] focus-visible:border-[#c12c11]',
              )}
            />
            <Button type="button" variant="outline" size="icon" onClick={handleCopyId} className="flex-shrink-0 h-9 w-9">
              {copied ? <Check className="h-3.5 w-3.5 text-green-700" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          {idError ? (
            <p className="text-[11px] text-[#c12c11] flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {idError}
            </p>
          ) : (
            <p className="text-[11px] text-[#656574] mt-1">
              Auto-generated from the contract name.
            </p>
          )}
        </GuidanceField>

        <div className="grid grid-cols-2 gap-4">
          <GuidanceField
            fieldId={READINESS_FIELD_CONTRACT_VERSION}
            label="Version"
            required
            isMissing={!semver.test(info.version)}
            missingHelper={READINESS_HELPER_CONTRACT_VERSION}
          >
            <div className="font-mono text-sm bg-[#f5f5fa] border border-[#d3d3e5] rounded-md px-3 h-9 flex items-center text-[#33333d]">
              v{info.version}
            </div>
          </GuidanceField>
          <div>
            <label className={labelClass}>Status</label>
            <div className="h-9 flex items-center">
              <Badge variant={info.status}>{STATUS_LABELS[info.status]}</Badge>
            </div>
          </div>
        </div>

        <GuidanceField
          fieldId={READINESS_FIELD_CONTRACT_PURPOSE}
          label="Business purpose"
          required={false}
          isMissing={!info.description.trim()}
        >
          <Textarea
            value={info.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Describe the purpose and scope of this data contract..."
            disabled={isLocked}
            className={cn(inputClass, 'min-h-[100px] resize-y text-sm')}
          />
        </GuidanceField>

        <div className="border border-[#e4e4f0] rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-[#33333d] bg-[#fbfbff] hover:bg-[#f5f5fa] transition-colors"
            onClick={() => setAdditionalOpen(o => !o)}
          >
            {additionalOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Additional context
          </button>
          {additionalOpen && (
            <div className="px-3 py-3 space-y-3 border-t border-[#e4e4f0]">
              <div>
                <label className={labelClass}>Usage</label>
                <Textarea
                  value={usage}
                  onChange={e => setUsage(e.target.value)}
                  placeholder="Describe expected usage patterns or supported use cases"
                  disabled={isLocked}
                  className={cn(inputClass, 'min-h-[72px] resize-y text-sm')}
                />
              </div>
              <div>
                <label className={labelClass}>Limitations</label>
                <Textarea
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  placeholder="Document quality, compliance, retention, or latency constraints"
                  disabled={isLocked}
                  className={cn(inputClass, 'min-h-[72px] resize-y text-sm')}
                />
              </div>
              <div ref={refLinksRef}>
                <label className={labelClass}>{LABEL_REFERENCE_LINKS}</label>
                <AuthoritativeDefinitionsEditor
                  definitions={authDefs}
                  onChange={defs => {
                    setAuthDefs(defs)
                    if (!isLocked) {
                      onChange({
                        descriptionAuthoritativeDefinitions: filterAuthoritativeDefinitionsForSave(defs),
                      })
                    }
                  }}
                  disabled={isLocked}
                />
              </div>
            </div>
          )}
        </div>

        <GuidanceField
          fieldId={READINESS_FIELD_CONTRACT_OWNER}
          label={LABEL_CONTRACT_OWNER}
          required
          isMissing={!info.owner.trim()}
          missingHelper={READINESS_HELPER_CONTRACT_OWNER}
        >
          <Input
            value={info.owner}
            onChange={e => onChange({ owner: e.target.value })}
            placeholder="e.g. Data Platform Team"
            disabled={ownerFieldLocked}
            className={ownerInputClass}
          />
          <p className="text-[11px] text-[#656574] mt-1 leading-snug flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            {!info.owner.trim() ? null : <span>{CONTRACT_OWNER_HELPER}</span>}
            <WorkflowMetadataPill variant="not-in-odcs" />
          </p>
        </GuidanceField>

        <div>
          <label className={labelClass}>Tags</label>
          <TagsEditor
            tags={tags}
            onChange={t => onChange({ tags: t })}
            disabled={isLocked}
            placeholder="Add governance, domain, or classification tags"
          />
        </div>
      </div>
      )}
    </div>
  )
}
