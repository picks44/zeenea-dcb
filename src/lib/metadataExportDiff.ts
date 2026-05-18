export interface ArrayChangeCount {
  added: number
  removed: number
  updated: number
}

export interface MetadataFormDiffRow {
  kind: 'added' | 'removed' | 'modified'
  label: string
  left: string
  right: string
  detail?: string
}

export interface MetadataDiffItem {
  key: string
  location: string
  label: string
  payload: Record<string, unknown>
}

function tableName(table: Record<string, unknown>): string {
  return String(table.physicalName ?? table.name ?? '')
}

function columnName(prop: Record<string, unknown>): string {
  return String(prop.name ?? prop.physicalName ?? '')
}

// ─── Quality rules ────────────────────────────────────────────────────────────

export function qualityRuleStableKey(
  table: string,
  column: string,
  rule: Record<string, unknown>,
): string {
  const id = String(rule.id ?? '').trim()
  if (id) return `${table}|${column}|id:${id}`
  const name = String(rule.name ?? '').trim()
  const desc = String(rule.description ?? '').trim()
  const type = String(rule.type ?? 'text').trim()
  return `${table}|${column}|${name}|${desc}|${type}`
}

export function qualityRuleDisplayLabel(rule: Record<string, unknown>): string {
  const name = String(rule.name ?? '').trim()
  if (name) return name
  const desc = String(rule.description ?? '').trim()
  if (desc.length > 48) return `${desc.slice(0, 48)}…`
  return desc || 'Quality rule'
}

export function collectExportedQualityRules(
  doc: Record<string, unknown>,
): Map<string, MetadataDiffItem> {
  const map = new Map<string, MetadataDiffItem>()
  const schema = doc.schema as unknown[] | undefined
  if (!schema) return map

  for (const table of schema) {
    if (!table || typeof table !== 'object') continue
    const t = table as Record<string, unknown>
    const tbl = tableName(t)

    for (const rule of (t.quality ?? []) as Record<string, unknown>[]) {
      const key = qualityRuleStableKey(tbl, '', rule)
      map.set(key, {
        key,
        location: tbl,
        label: qualityRuleDisplayLabel(rule),
        payload: rule,
      })
    }

    for (const prop of (t.properties ?? []) as Record<string, unknown>[]) {
      const col = columnName(prop)
      for (const rule of (prop.quality ?? []) as Record<string, unknown>[]) {
        const key = qualityRuleStableKey(tbl, col, rule)
        map.set(key, {
          key,
          location: `${tbl}.${col}`,
          label: qualityRuleDisplayLabel(rule),
          payload: rule,
        })
      }
    }
  }

  return map
}

export function diffExportedQualityRules(
  leftDoc: Record<string, unknown>,
  rightDoc: Record<string, unknown>,
): { counts: ArrayChangeCount; rows: MetadataFormDiffRow[] } {
  const left = collectExportedQualityRules(leftDoc)
  const right = collectExportedQualityRules(rightDoc)
  const rows: MetadataFormDiffRow[] = []
  let added = 0
  let removed = 0
  let updated = 0

  for (const [key, item] of right) {
    const prev = left.get(key)
    if (!prev) {
      added++
      rows.push({
        kind: 'added',
        label: item.location,
        left: '',
        right: item.label,
        detail: `Added ${item.label}`,
      })
    } else if (JSON.stringify(prev.payload) !== JSON.stringify(item.payload)) {
      updated++
      rows.push({
        kind: 'modified',
        label: item.location,
        left: prev.label,
        right: item.label,
        detail: `Updated ${item.label}`,
      })
    }
  }

  for (const [key, item] of left) {
    if (!right.has(key)) {
      removed++
      rows.push({
        kind: 'removed',
        label: item.location,
        left: item.label,
        right: '',
        detail: `Removed ${item.label}`,
      })
    }
  }

  return { counts: { added, removed, updated }, rows }
}

// ─── Authoritative links ──────────────────────────────────────────────────────

export function authLinkStableKey(
  location: string,
  link: Record<string, unknown>,
): string {
  const id = String(link.id ?? '').trim()
  if (id) return `${location}|id:${id}`
  const url = String(link.url ?? '').trim()
  const type = String(link.type ?? '').trim()
  return `${location}|${url}|${type}`
}

export function authLinkDisplayLabel(link: Record<string, unknown>): string {
  const type = String(link.type ?? '').trim()
  const url = String(link.url ?? '').trim()
  if (type && url) return type
  return url || type || 'Authoritative link'
}

export function collectExportedAuthLinks(
  doc: Record<string, unknown>,
): Map<string, MetadataDiffItem> {
  const map = new Map<string, MetadataDiffItem>()

  const description = doc.description as Record<string, unknown> | undefined
  for (const link of (description?.authoritativeDefinitions ?? []) as Record<string, unknown>[]) {
    const location = 'contract description'
    const key = authLinkStableKey(location, link)
    map.set(key, {
      key,
      location,
      label: authLinkDisplayLabel(link),
      payload: link,
    })
  }

  const schema = doc.schema as unknown[] | undefined
  if (!schema) return map

  for (const table of schema) {
    if (!table || typeof table !== 'object') continue
    const t = table as Record<string, unknown>
    const tbl = tableName(t)

    for (const link of (t.authoritativeDefinitions ?? []) as Record<string, unknown>[]) {
      const key = authLinkStableKey(tbl, link)
      map.set(key, {
        key,
        location: tbl,
        label: authLinkDisplayLabel(link),
        payload: link,
      })
    }

    for (const prop of (t.properties ?? []) as Record<string, unknown>[]) {
      const col = columnName(prop)
      for (const link of (prop.authoritativeDefinitions ?? []) as Record<string, unknown>[]) {
        const key = authLinkStableKey(`${tbl}.${col}`, link)
        map.set(key, {
          key,
          location: `${tbl}.${col}`,
          label: authLinkDisplayLabel(link),
          payload: link,
        })
      }
    }
  }

  return map
}

export function diffExportedAuthLinks(
  leftDoc: Record<string, unknown>,
  rightDoc: Record<string, unknown>,
): { counts: ArrayChangeCount; rows: MetadataFormDiffRow[] } {
  const left = collectExportedAuthLinks(leftDoc)
  const right = collectExportedAuthLinks(rightDoc)
  const rows: MetadataFormDiffRow[] = []
  let added = 0
  let removed = 0
  let updated = 0

  for (const [key, item] of right) {
    const prev = left.get(key)
    if (!prev) {
      added++
      rows.push({
        kind: 'added',
        label: item.location,
        left: '',
        right: item.label,
        detail: `Added ${item.label}`,
      })
    } else if (JSON.stringify(prev.payload) !== JSON.stringify(item.payload)) {
      updated++
      rows.push({
        kind: 'modified',
        label: item.location,
        left: prev.label,
        right: item.label,
        detail: `Updated ${item.label}`,
      })
    }
  }

  for (const [key, item] of left) {
    if (!right.has(key)) {
      removed++
      rows.push({
        kind: 'removed',
        label: item.location,
        left: item.label,
        right: '',
        detail: `Removed ${item.label}`,
      })
    }
  }

  return { counts: { added, removed, updated }, rows }
}
