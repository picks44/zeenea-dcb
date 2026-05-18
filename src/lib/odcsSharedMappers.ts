import type { AuthoritativeDefinition, QualityRule } from '@/types/odcsShared'
import { generateId } from '@/lib/utils'

function stripUndefined(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) delete obj[key]
  }
}

export function ensureQualityRuleIds(rules: QualityRule[]): QualityRule[] {
  return rules.map(r => ({
    ...r,
    id: r.id?.trim() || generateId(),
    type: 'text' as const,
  }))
}

export function mapQualityRulesToYaml(rules: QualityRule[]): Record<string, unknown>[] {
  return ensureQualityRuleIds(rules)
    .filter(r => r.description?.trim())
    .map(q => {
      const rule: Record<string, unknown> = {
        id: q.id,
        type: 'text',
        description: q.description.trim(),
      }
      if (q.name?.trim()) rule.name = q.name.trim()
      if (q.dimension?.trim()) rule.dimension = q.dimension.trim()
      if (q.severity?.trim()) rule.severity = q.severity.trim()
      if (q.businessImpact?.trim()) rule.businessImpact = q.businessImpact.trim()
      stripUndefined(rule)
      return rule
    })
}

export function mapTagsToYaml(tags: string[] | undefined): string[] | undefined {
  if (!tags?.length) return undefined
  const cleaned = tags.map(t => t.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned : undefined
}

export function isAuthoritativeDefinitionEmpty(d: AuthoritativeDefinition): boolean {
  return !d.url?.trim() && !d.type?.trim() && !d.description?.trim()
}

export function isAuthoritativeDefinitionComplete(d: AuthoritativeDefinition): boolean {
  return !!d.url?.trim() && !!d.type?.trim()
}

export function isAuthoritativeDefinitionPartial(d: AuthoritativeDefinition): boolean {
  return !isAuthoritativeDefinitionEmpty(d) && !isAuthoritativeDefinitionComplete(d)
}

export function getAuthoritativeLinkFieldErrors(
  def: AuthoritativeDefinition,
): { url?: string; type?: string } {
  if (isAuthoritativeDefinitionEmpty(def) || isAuthoritativeDefinitionComplete(def)) {
    return {}
  }
  const errors: { url?: string; type?: string } = {}
  if (!def.url?.trim()) errors.url = 'URL is required.'
  if (!def.type?.trim()) errors.type = 'Type is required.'
  return errors
}

export function hasInvalidAuthoritativeDefinitions(
  defs: AuthoritativeDefinition[],
): boolean {
  return defs.some(isAuthoritativeDefinitionPartial)
}

/** Persist only complete links; empty rows are omitted. */
export function filterAuthoritativeDefinitionsForPersist(
  defs: AuthoritativeDefinition[],
): AuthoritativeDefinition[] {
  return defs.filter(isAuthoritativeDefinitionComplete)
}

export function mapAuthoritativeDefinitionsToYaml(
  defs: AuthoritativeDefinition[] | undefined,
): Record<string, unknown>[] | undefined {
  if (!defs?.length) return undefined
  const mapped = defs
    .filter(d => !isAuthoritativeDefinitionEmpty(d))
    .filter(isAuthoritativeDefinitionComplete)
    .map(d => {
      const entry: Record<string, unknown> = {
        url: d.url.trim(),
        type: d.type.trim(),
      }
      if (d.description?.trim()) entry.description = d.description.trim()
      return entry
    })
  return mapped.length > 0 ? mapped : undefined
}

export function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return []
  return tags.map(t => t.trim()).filter(Boolean)
}

export function filterAuthoritativeDefinitionsForSave(
  defs: AuthoritativeDefinition[],
): AuthoritativeDefinition[] {
  return defs.filter(d => !isAuthoritativeDefinitionEmpty(d))
}

export function filterQualityRulesForSave(rules: QualityRule[]): QualityRule[] {
  return ensureQualityRuleIds(rules).filter(r => r.description?.trim())
}

export function migrateExamplesField(examples: string | string[] | undefined): string[] {
  if (Array.isArray(examples)) {
    return examples.map(e => String(e).trim()).filter(Boolean)
  }
  if (typeof examples === 'string' && examples.trim()) {
    if (examples.includes('\n')) {
      return examples.split('\n').map(s => s.trim()).filter(Boolean)
    }
    return examples.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}
