import { buildOdcsDocument, contractFromSnapshot } from './odcsYamlGenerator'
import { DataContract, DataContractSnapshot, OdcsAccessRole, SlaProperty } from '../types/odcs'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArrayChangeCount {
  added: number
  removed: number
  updated: number
}

export interface FormDiffRow {
  kind: 'added' | 'removed' | 'modified'
  label: string
  left: string
  right: string
  detail?: string
}

export interface FormDiffSection {
  id: string
  title: string
  rows: FormDiffRow[]
}

export interface ExportedContractDiff {
  identical: boolean
  summaryLines: string[]
  schema: ArrayChangeCount
  formSections: FormDiffSection[]
}

// ─── Export payloads ──────────────────────────────────────────────────────────

export function exportDocumentFromSnapshot(snapshot: DataContractSnapshot): Record<string, unknown> {
  return buildOdcsDocument(contractFromSnapshot(snapshot))
}

export function exportDocumentFromContract(contract: DataContract): Record<string, unknown> {
  return buildOdcsDocument(contract)
}

export function exportedSnapshotsEqual(
  left: DataContractSnapshot,
  right: DataContractSnapshot,
): boolean {
  return JSON.stringify(exportDocumentFromSnapshot(left)) === JSON.stringify(exportDocumentFromSnapshot(right))
}

// ─── Diff helpers ─────────────────────────────────────────────────────────────

function countLabel(n: number, singular: string, plural: string): string {
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`
}

function diffByKey<T>(
  left: T[],
  right: T[],
  keyFn: (item: T) => string,
  eqFn: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
): ArrayChangeCount {
  const leftMap = new Map(left.map(item => [keyFn(item), item]))
  const rightMap = new Map(right.map(item => [keyFn(item), item]))
  let added = 0
  let removed = 0
  let updated = 0
  for (const [key, rightItem] of rightMap) {
    const leftItem = leftMap.get(key)
    if (!leftItem) added++
    else if (!eqFn(leftItem, rightItem)) updated++
  }
  for (const key of leftMap.keys()) {
    if (!rightMap.has(key)) removed++
  }
  return { added, removed, updated }
}

function flattenSchemaProperties(
  schema: unknown[] | undefined,
): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>()
  if (!schema) return map
  for (const table of schema) {
    if (!table || typeof table !== 'object') continue
    const t = table as Record<string, unknown>
    const tableName = String(t.physicalName ?? t.name ?? '')
    const props = (t.properties ?? []) as Record<string, unknown>[]
    for (const prop of props) {
      const col = String(prop.name ?? prop.physicalName ?? '')
      map.set(`${tableName}.${col}`, prop)
    }
  }
  return map
}

function schemaDiff(
  leftSchema: unknown[] | undefined,
  rightSchema: unknown[] | undefined,
): ArrayChangeCount {
  const left = flattenSchemaProperties(leftSchema)
  const right = flattenSchemaProperties(rightSchema)
  let added = 0
  let removed = 0
  let updated = 0
  for (const [key, rightProp] of right) {
    const leftProp = left.get(key)
    if (!leftProp) added++
    else if (JSON.stringify(leftProp) !== JSON.stringify(rightProp)) updated++
  }
  for (const key of left.keys()) {
    if (!right.has(key)) removed++
  }
  return { added, removed, updated }
}

function tagsKey(tags: unknown): string {
  if (!Array.isArray(tags)) return ''
  return tags.map(String).sort().join('|')
}

function roleKey(r: OdcsAccessRole): string {
  return `${r.role}::${r.access}`
}

function slaKey(s: SlaProperty): string {
  return s.property
}

function buildSchemaFormRows(
  leftDoc: Record<string, unknown>,
  rightDoc: Record<string, unknown>,
): FormDiffRow[] {
  const left = flattenSchemaProperties(leftDoc.schema as unknown[] | undefined)
  const right = flattenSchemaProperties(rightDoc.schema as unknown[] | undefined)
  const keys = Array.from(new Set([...left.keys(), ...right.keys()]))
  const rows: FormDiffRow[] = []

  for (const key of keys) {
    const l = left.get(key)
    const r = right.get(key)
    const label = key.includes('.') ? key.split('.').pop() ?? key : key
    if (!l && r) {
      rows.push({
        kind: 'added',
        label,
        left: '',
        right: String(r.logicalType ?? r.name ?? 'field'),
      })
    } else if (l && !r) {
      rows.push({
        kind: 'removed',
        label,
        left: String(l.logicalType ?? l.name ?? 'field'),
        right: '',
      })
    } else if (l && r && JSON.stringify(l) !== JSON.stringify(r)) {
      rows.push({
        kind: 'modified',
        label,
        left: String(l.logicalType ?? l.name ?? ''),
        right: String(r.logicalType ?? r.name ?? ''),
        detail: 'Exported field definition changed',
      })
    }
  }
  return rows
}

function buildRoleFormRows(left: OdcsAccessRole[], right: OdcsAccessRole[]): FormDiffRow[] {
  const rows: FormDiffRow[] = []
  const leftMap = new Map(left.map(r => [roleKey(r), r]))
  const rightMap = new Map(right.map(r => [roleKey(r), r]))

  for (const [key, r] of rightMap) {
    if (!leftMap.has(key)) {
      rows.push({
        kind: 'added',
        label: r.role,
        left: '',
        right: `${r.access}${r.description ? ` — ${r.description}` : ''}`,
      })
    } else {
      const l = leftMap.get(key)!
      if (JSON.stringify(l) !== JSON.stringify(r)) {
        rows.push({
          kind: 'modified',
          label: r.role,
          left: l.description ?? l.access,
          right: r.description ?? r.access,
          detail: l.access !== r.access ? `Access: ${l.access} → ${r.access}` : undefined,
        })
      }
    }
  }
  for (const [key, l] of leftMap) {
    if (!rightMap.has(key)) {
      rows.push({
        kind: 'removed',
        label: l.role,
        left: `${l.access}${l.description ? ` — ${l.description}` : ''}`,
        right: '',
      })
    }
  }
  return rows
}

function buildSlaFormRows(left: SlaProperty[], right: SlaProperty[]): FormDiffRow[] {
  const rows: FormDiffRow[] = []
  const leftMap = new Map(left.map(s => [slaKey(s), s]))
  const rightMap = new Map(right.map(s => [slaKey(s), s]))

  for (const [key, r] of rightMap) {
    if (!leftMap.has(key)) {
      rows.push({ kind: 'added', label: r.property, left: '', right: String(r.value) })
    } else {
      const l = leftMap.get(key)!
      if (JSON.stringify(l) !== JSON.stringify(r)) {
        rows.push({
          kind: 'modified',
          label: r.property,
          left: String(l.value),
          right: String(r.value),
        })
      }
    }
  }
  for (const [key, l] of leftMap) {
    if (!rightMap.has(key)) {
      rows.push({ kind: 'removed', label: l.property, left: String(l.value), right: '' })
    }
  }
  return rows
}

function buildSummaryLines(parts: {
  schema: ArrayChangeCount
  roles: ArrayChangeCount
  sla: ArrayChangeCount
  descriptionChanged: boolean
  metadataChanged: boolean
}): string[] {
  const lines: string[] = []
  const { schema, roles, sla } = parts

  if (schema.added) lines.push(`${countLabel(schema.added, 'field', 'fields')} added`)
  if (schema.removed) lines.push(`${countLabel(schema.removed, 'field', 'fields')} removed`)
  if (schema.updated) lines.push(`${countLabel(schema.updated, 'field', 'fields')} updated`)

  if (roles.added) lines.push(`${countLabel(roles.added, 'data access role', 'data access roles')} added`)
  if (roles.removed) lines.push(`${countLabel(roles.removed, 'data access role', 'data access roles')} removed`)
  if (roles.updated) lines.push(`${countLabel(roles.updated, 'data access role', 'data access roles')} updated`)

  if (sla.added) lines.push(`${countLabel(sla.added, 'SLA property', 'SLA properties')} added`)
  if (sla.removed) lines.push(`${countLabel(sla.removed, 'SLA property', 'SLA properties')} removed`)
  if (sla.updated) lines.push(`${countLabel(sla.updated, 'SLA', 'SLAs')} updated`)

  if (parts.descriptionChanged) lines.push('Contract description updated')
  if (parts.metadataChanged) lines.push('Contract metadata updated')

  return lines
}

// ─── Main compare ─────────────────────────────────────────────────────────────

/** Compare two versions using exported ODCS payloads (canonical source of truth). */
export function compareExportedSnapshots(
  left: DataContractSnapshot,
  right: DataContractSnapshot,
): ExportedContractDiff {
  const leftDoc = exportDocumentFromSnapshot(left)
  const rightDoc = exportDocumentFromSnapshot(right)
  const identical = JSON.stringify(leftDoc) === JSON.stringify(rightDoc)

  if (identical) {
    return { identical: true, summaryLines: [], schema: { added: 0, removed: 0, updated: 0 }, formSections: [] }
  }

  const schema = schemaDiff(
    leftDoc.schema as unknown[] | undefined,
    rightDoc.schema as unknown[] | undefined,
  )

  const leftRoles = (left.roles ?? []).filter(r => r.role.trim())
  const rightRoles = (right.roles ?? []).filter(r => r.role.trim())
  const roles = diffByKey(leftRoles, rightRoles, roleKey)

  const leftSla = (left.slaProperties ?? []).filter(s => s.property.trim())
  const rightSla = (right.slaProperties ?? []).filter(s => s.property.trim())
  const sla = diffByKey(leftSla, rightSla, slaKey)

  const leftDesc = (leftDoc.description ?? {}) as Record<string, unknown>
  const rightDesc = (rightDoc.description ?? {}) as Record<string, unknown>
  const descriptionChanged = JSON.stringify(leftDesc) !== JSON.stringify(rightDesc)

  const metadataKeys = ['id', 'version', 'status', 'name', 'dataProduct', 'domain', 'tags'] as const
  const metadataChanged = metadataKeys.some(
    key => JSON.stringify(leftDoc[key]) !== JSON.stringify(rightDoc[key]),
  )

  const summaryLines = buildSummaryLines({ schema, roles, sla, descriptionChanged, metadataChanged })

  const formSections: FormDiffSection[] = []

  const metadataRows: FormDiffRow[] = []
  const infoFields: { key: keyof DataContractSnapshot['info'] | 'id'; label: string; exported: boolean }[] = [
    { key: 'id', label: 'Contract ID', exported: true },
    { key: 'title', label: 'Title', exported: true },
    { key: 'version', label: 'Version', exported: true },
    { key: 'status', label: 'Status', exported: true },
    { key: 'domain', label: 'Domain', exported: true },
    { key: 'description', label: 'Purpose', exported: true },
    { key: 'descriptionUsage', label: 'Usage', exported: true },
    { key: 'descriptionLimitations', label: 'Limitations', exported: true },
  ]

  for (const { key, label } of infoFields) {
    const l = key === 'id' ? left.id : (left.info[key as keyof typeof left.info] ?? '')
    const r = key === 'id' ? right.id : (right.info[key as keyof typeof right.info] ?? '')
    const ls = String(l ?? '')
    const rs = String(r ?? '')
    if (ls !== rs) {
      metadataRows.push({ kind: 'modified', label, left: ls, right: rs })
    }
  }

  const leftTags = tagsKey(leftDoc.tags)
  const rightTags = tagsKey(rightDoc.tags)
  if (leftTags !== rightTags) {
    metadataRows.push({
      kind: 'modified',
      label: 'Tags',
      left: leftTags.replace(/\|/g, ', '),
      right: rightTags.replace(/\|/g, ', '),
    })
  }

  if (metadataRows.length > 0) {
    formSections.push({ id: 'metadata', title: 'Contract metadata', rows: metadataRows })
  }

  const schemaRows = buildSchemaFormRows(leftDoc, rightDoc)
  if (schemaRows.length > 0) {
    formSections.push({ id: 'schema', title: 'Schema', rows: schemaRows })
  }

  const roleRows = buildRoleFormRows(leftRoles, rightRoles)
  if (roleRows.length > 0) {
    formSections.push({ id: 'roles', title: 'Data access roles', rows: roleRows })
  }

  const slaRows = buildSlaFormRows(leftSla, rightSla)
  if (slaRows.length > 0) {
    formSections.push({ id: 'sla', title: 'Service levels', rows: slaRows })
  }

  if (formSections.length === 0 && summaryLines.length > 0) {
    formSections.push({
      id: 'export',
      title: 'Exported contract',
      rows: [{
        kind: 'modified',
        label: 'ODCS export',
        left: 'Previous version',
        right: 'Current version',
        detail: summaryLines.join(' · '),
      }],
    })
  }

  return { identical, summaryLines, schema, formSections }
}

export function contractToComparisonSnapshot(contract: DataContract): DataContractSnapshot {
  return {
    id: contract.id,
    info: { ...contract.info },
    dataset: JSON.parse(JSON.stringify(contract.dataset)),
    stakeholders: [...contract.stakeholders],
    roles: [...(contract.roles ?? [])],
    slaProperties: [...(contract.slaProperties ?? [])],
  }
}

/** Changes from previous (older) → current (newer) using exported ODCS payloads. */
export function summarizeExportChangesSince(
  current: DataContract,
  previous: DataContractSnapshot,
): ExportedContractDiff {
  return compareExportedSnapshots(previous, contractToComparisonSnapshot(current))
}

/**
 * Whether the contract has a working copy distinct from the last publish.
 * Active + read-only contracts with no export diff do NOT count as a draft.
 */
export function hasWorkingCopyDraft(contract: DataContract): boolean {
  if (contract.info.status === 'draft') return true
  if (contract.inRevision) return true

  const lastCommit = contract.gitHistory[contract.gitHistory.length - 1]
  if (!lastCommit?.snapshot) return false
  if (new Date(contract.updatedAt) <= new Date(lastCommit.timestamp)) return false

  return !summarizeExportChangesSince(contract, lastCommit.snapshot).identical
}

const NO_EXPORTED_CHANGES = 'No exported ODCS changes'

function changelogLineForRow(sectionId: string, row: FormDiffRow): string {
  switch (sectionId) {
    case 'roles':
      if (row.kind === 'added') return `Added ${row.label} access role`
      if (row.kind === 'removed') return `Removed ${row.label} access role`
      return `Updated ${row.label} access role`
    case 'sla':
      if (row.kind === 'added') return `Added ${row.label} SLA property`
      if (row.kind === 'removed') return `Removed ${row.label} SLA property`
      if (row.left && row.right) return `Updated ${row.label} SLA from ${row.left} to ${row.right}`
      return `Updated ${row.label} SLA property`
    case 'schema':
      if (row.kind === 'added') return `Added ${row.label} field`
      if (row.kind === 'removed') return `Removed ${row.label} field`
      return `Updated ${row.label} field`
    case 'metadata':
      if (row.label === 'Purpose') return 'Updated contract purpose description'
      if (row.label === 'Usage') return 'Updated contract usage description'
      if (row.label === 'Limitations') return 'Updated contract limitations description'
      if (row.label === 'Tags') return 'Updated contract tags'
      if (row.label === 'Domain') return `Updated domain to ${row.right}`
      if (row.label === 'Title') return `Updated contract title`
      if (row.label === 'Contract ID') return 'Updated contract ID'
      return `Updated ${row.label.toLowerCase()}`
    default:
      return row.detail ?? `Updated ${row.label}`
  }
}

/** Human-readable multiline changelog for publish (export-aware, deterministic). */
export function buildPublishChangelog(diff: ExportedContractDiff): string {
  if (diff.identical) return NO_EXPORTED_CHANGES

  const lines: string[] = []
  for (const section of diff.formSections) {
    for (const row of section.rows) {
      lines.push(changelogLineForRow(section.id, row))
    }
  }

  if (lines.length === 0) return NO_EXPORTED_CHANGES
  return lines.join('\n')
}
