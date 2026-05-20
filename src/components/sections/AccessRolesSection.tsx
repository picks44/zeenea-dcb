import { Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OdcsAccessRole } from '@/types/odcs'
import { generateId, cn } from '@/lib/utils'
import { GovernanceDeleteButton } from '@/components/shared/GovernanceDeleteButton'
import { GovernanceEmptyState } from '@/components/shared/GovernanceEmptyState'
import { GovernanceTableFooter } from '@/components/shared/GovernanceTableFooter'
import { AccessRoleDocRow } from '@/components/shared/AccessRoleDocRow'
import { GovernanceReadOnlyCell } from '@/components/shared/GovernanceReadOnlyCell'
import { GovernanceDocList } from '@/components/shared/GovernanceDocList'
import { docGovernanceShellClass, docGovernanceHeadClass, docGovernanceHeadRowClass, docGovernanceRowClass } from '@/components/shared/docViewTokens'
import { ContractSectionHeader } from '@/components/shared/ContractSectionHeader'
import {
  governanceTableHeadClass,
  governanceTableRowClass,
  governanceTableHeadRowClass,
  governanceTableShellClass,
} from '@/components/shared/GovernanceSectionHeader'
import { GovernanceSectionMeta } from '@/components/shared/GovernanceSectionMeta'
import {
  GovernanceIncompleteRowHint,
  governanceIncompleteRowClass,
} from '@/components/shared/GovernanceIncompleteRowHint'
import {
  isAccessRoleRowIncomplete,
  summarizeAccessRoles,
} from '@/lib/governanceSectionSummary'
import { useReadinessNavigation } from '@/components/readiness/ReadinessNavigationContext'
import {
  DATA_ACCESS_AUTOSAVE_NOTE,
  DATA_ACCESS_EMPTY_BODY,
  DATA_ACCESS_EMPTY_CTA,
  DATA_ACCESS_EMPTY_TITLE,
  DATA_ACCESS_ADD_ROLE_CTA,
  DATA_ACCESS_ROLES_INTRO,
  formatAccessRolesSummaryLine,
  GOVERNANCE_ROW_INCOMPLETE_ACCESS_ROLE,
} from '@/lib/uxCopy'
import {
  GOVERNANCE_SECTION_WIDTH_FULL_CLASS,
  GOVERNANCE_SECTION_WIDTH_STANDARD_CLASS,
} from '@/lib/governanceLayout'
import { shouldUseCompactReadOnly } from '@/lib/governanceReadOnlyLayout'

interface AccessRolesSectionProps {
  roles: OdcsAccessRole[]
  onChange: (roles: OdcsAccessRole[]) => void
  isLocked: boolean
  docCompact?: boolean
}

const ACCESS_GRID =
  'grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1.2fr)_32px] gap-x-3 gap-y-0 items-center'

const ACCESS_GRID_READONLY =
  'grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1.2fr)] gap-x-3 gap-y-0 items-center'

function makeRole(): OdcsAccessRole {
  return { id: generateId(), role: '', access: 'read', description: '' }
}

function formatAccess(access: string): string {
  if (access === 'read') return 'Read'
  if (access === 'write') return 'Write'
  return access.trim() || '-'
}

function AccessRoleReadOnlyCells({ role }: { role: OdcsAccessRole }) {
  return (
    <>
      <GovernanceReadOnlyCell value={role.role} />
      <GovernanceReadOnlyCell value={formatAccess(role.access)} />
      <GovernanceReadOnlyCell value={role.description ?? ''} />
    </>
  )
}

export function AccessRolesSection({ roles, onChange, isLocked, docCompact }: AccessRolesSectionProps) {
  const readinessNav = useReadinessNavigation()
  const publishAttempted = readinessNav?.publishAttempted ?? false
  const roleSummary = summarizeAccessRoles(roles)
  const summaryLine = formatAccessRolesSummaryLine(
    roleSummary.includedInYaml,
    roleSummary.incomplete,
  )

  const update = (id: string, patch: Partial<OdcsAccessRole>) =>
    onChange(roles.map(r => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: string) => onChange(roles.filter(r => r.id !== id))

  const gridClass = isLocked ? ACCESS_GRID_READONLY : ACCESS_GRID
  const useDocLayout = shouldUseCompactReadOnly(isLocked, roles.length)
  /** Hide table column labels when a single published doc row is self-explanatory. */
  const hideHeader = isLocked && roles.length === 1

  return (
    <div className={cn(GOVERNANCE_SECTION_WIDTH_STANDARD_CLASS, GOVERNANCE_SECTION_WIDTH_FULL_CLASS)}>
      <ContractSectionHeader
        title="Data access roles"
        description={DATA_ACCESS_ROLES_INTRO}
        compact={docCompact && isLocked}
      />

      {!isLocked ? (
        <GovernanceSectionMeta
          autosaveNote={DATA_ACCESS_AUTOSAVE_NOTE}
          summaryLine={summaryLine}
        />
      ) : null}

      {roles.length === 0 ? (
        <GovernanceEmptyState
          icon={Shield}
          title={DATA_ACCESS_EMPTY_TITLE}
          body={DATA_ACCESS_EMPTY_BODY}
          ctaLabel={DATA_ACCESS_EMPTY_CTA}
          onCta={() => onChange([makeRole()])}
          isLocked={isLocked}
        />
      ) : useDocLayout ? (
        roles.length === 1 ? (
          <div className={docGovernanceShellClass}>
            <AccessRoleDocRow role={roles[0]} compact={docCompact} />
          </div>
        ) : (
          <GovernanceDocList>
            {roles.map(r => (
              <AccessRoleDocRow key={r.id} role={r} compact={docCompact} />
            ))}
          </GovernanceDocList>
        )
      ) : (
        <div
          className={cn(
            isLocked ? docGovernanceShellClass : governanceTableShellClass,
            'overflow-x-auto',
          )}
        >
          {!hideHeader && (
            <div
              className={cn(
                gridClass,
                isLocked ? docGovernanceHeadRowClass : governanceTableHeadRowClass,
                'px-3',
              )}
            >
              <span className={isLocked ? docGovernanceHeadClass : governanceTableHeadClass}>Role</span>
              <span className={isLocked ? docGovernanceHeadClass : governanceTableHeadClass}>Access</span>
              <span className={isLocked ? docGovernanceHeadClass : governanceTableHeadClass}>Description</span>
              {!isLocked && <span />}
            </div>
          )}

          <div className="divide-y divide-neutral-100">
            {roles.map(r => {
              const rowIncomplete = isAccessRoleRowIncomplete(r)
              const showRowEmphasis = publishAttempted && rowIncomplete
              return (
                <div
                  key={r.id}
                  className={cn(
                    gridClass,
                    isLocked ? docGovernanceRowClass : governanceTableRowClass,
                    !isLocked && showRowEmphasis && governanceIncompleteRowClass(true),
                  )}
                >
                  {isLocked ? (
                    <AccessRoleReadOnlyCells role={r} />
                  ) : (
                    <>
                      <div className="min-w-0">
                        <Input
                          value={r.role}
                          onChange={e => update(r.id, { role: e.target.value })}
                          placeholder="e.g. analytics_user"
                          className="h-8 text-xs"
                          data-readiness-control=""
                        />
                        <GovernanceIncompleteRowHint
                          show={showRowEmphasis}
                          message={GOVERNANCE_ROW_INCOMPLETE_ACCESS_ROLE}
                        />
                      </div>
                      <Select
                        value={r.access}
                        onValueChange={v => v && update(r.id, { access: v as 'read' | 'write' })}
                      >
                        <SelectTrigger className="h-8 text-xs w-full" data-readiness-control="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read" className="text-xs">Read</SelectItem>
                          <SelectItem value="write" className="text-xs">Write</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={r.description ?? ''}
                        onChange={e => update(r.id, { description: e.target.value })}
                        placeholder="Optional note"
                        rows={1}
                        className="text-xs min-h-[32px] resize-none py-1.5"
                      />
                      <GovernanceDeleteButton
                        onClick={() => remove(r.id)}
                        aria-label="Remove role"
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {!isLocked && (
            <GovernanceTableFooter
              label={DATA_ACCESS_ADD_ROLE_CTA}
              onAdd={() => onChange([...roles, makeRole()])}
            />
          )}
        </div>
      )}
    </div>
  )
}
